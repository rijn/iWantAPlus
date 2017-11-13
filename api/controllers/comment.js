const _ = require('lodash');
const { pipeline, pick, deserialize } = require('../utils');
const { User, Comment, Course, Section, Professor, sequelize: { QueryTypes }, utils: { mixin } } = require('../../models');
mixin(_);
const { ServerError } = require('../middleware/error-handler');

exports.get = (options) => {
    let tasks = [
        pick([ 'CourseId', 'SectionId', 'ProfessorId', 'id' ]),
        conditions => _.join(_.map(conditions, (v, k) => `Comments.${k}=` + _.escape(v)), ' AND '),
        (conditions) => {
            return _.query(`
                SELECT
                    Comments.id,
                    Comments.content, Comments.rating,
                    Courses.id as Course_id,
                    Sections.id as Section_id,
                    Professors.id as Professor_id
                FROM Comments
                    LEFT JOIN Users
                    ON Comments.UserId = Users.id
                    LEFT JOIN Courses
                    ON Comments.CourseId = Courses.id
                    LEFT JOIN Sections
                    ON Comments.SectionId = Sections.id
                    LEFT JOIN Professors
                    ON Comments.ProfessorId = Professors.id
                WHERE ${conditions};
            `, {
                type: QueryTypes.SELECT
            });
        },
        deserialize
    ];

    return pipeline(tasks, options);
};

exports.post = (object, options) => {
    let tasks = [
        (options) => {
            return Comment.create(_.assign(
                {
                    UserId: options.mw.user.id
                },
                _.pick(options, 'CourseId', 'SectionId', 'ProfessorId'),
                object
            ), {
                include: [ User, Course, Section, Professor ]
            });
        },
        () => ({})
    ];

    return pipeline(tasks, options);
};

let checkUserAndComment = (CommentId, UserId) => {
    return _.query(`SELECT COUNT(*) as quant
                            FROM Comments, Users
                            WHERE Comments.UserId = Users.id
                                and Comments.UserId = ${UserId}
                                and Comments.id = ${CommentId}`).then((result) => {

                                    if (result[0][0].quant == 0){
                                        //console.log('BBBBB');
                                        throw ServerError({ message: "Not your comment", statusCode: 400 });
                                    }
                                    return;
                                });
}

exports.update = (object, options) => {
    let tasks = [
        () => {
            return checkUserAndComment(options.id, options.mw.user.id);
        },
        () => {
            return _.query(`UPDATE Comments
                            SET content = \'${object.content}\'
                            WHERE Comments.id = ${options.id}`)
            .then((result) => {
                return "Update Success";
            });
        }
    ];

    return pipeline(tasks);
};

exports.delete = (options) => {
    // delete comment through id
    let tasks = [
        // todo
        (options) => {
            return checkUserAndComment(options.id, options.mw.user.id);
        },
        () =>{
            return _.query(`DELETE FROM Comments WHERE Comments.id = ${options.id}`)
        }

    ];

    return pipeline(tasks, options);
};

exports.getAllMyComments = (options) => {
    let tasks = [
        (options) => {
            console.log(options);
            return options.mw.user.getComments();
        }
    ];

    return pipeline(tasks, options);
}

exports.getCommentsOfCourse = (options) => {
    let tasks = [
        (options) => {
            return _.query(`SELECT
                    Comments.id, Comments.content, Comments.createdAt, Comments.updatedAt,
                    Users.id as user_id, Users.email as user_email
                FROM Users, Courses, Comments
                WHERE Users.id = Comments.UserId
                    AND Courses.id = Comments.CourseId
                    AND Courses.id = ${options.id}`);
        },
        data => _.get(data, '0.0'),
        deserialize
    ];

    return pipeline(tasks, options);
}
