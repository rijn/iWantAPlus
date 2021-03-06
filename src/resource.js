import Vue from 'vue';
import VueResource from 'vue-resource';
import _ from 'lodash';
import store from './store';

Vue.use(VueResource);
Vue.http.options.root = '/api';

let token = store.getters['user/token'];
if (token) {
    Vue.http.headers.common['Authorization'] = `Bearer ${token}`;
}

export default class Resource {
    static models;

    constructor (props) {
        this.models = {};
    }

    static install (Vue, options) {
        let models = {
            user: Vue.resource('user{/id}', {}, {
                login: { method: 'POST', url: 'user/login' },
                signup: { method: 'POST', url: 'user' },
                getComment: { method: 'GET', url: 'user/comment' },
                getFavorite: { method: 'GET', url: 'user/favorite' }
            }),
            course: Vue.resource('course{/id}', {}, {
                search: { method: 'GET', url: 'course' },
                addComment: { method: 'POST', url: 'course{/id}/comment' },
                getCommentDelegate: { method: 'GET', url: 'course{/id}/comment' }
            }),
            professor: Vue.resource('professor{/id}', {}, {
                ac: { method: 'GET', url: 'professor/ac' }
            }),
            comment: Vue.resource('comment{/id}', {}, {}),
            favorite: Vue.resource('favorite{/id}', {}, {}),
            top: {
                rating: Vue.resource('toprating'),
                gpa: Vue.resource('topgpa')
            }
        };

        this.models = models;

        this.models.course.addComment = _.curry(this.models.course.addComment, 2);
        this.models.comment.update = _.curry(this.models.comment.update, 2);
        this.models.course.getComment = function (arg) { return function () { return models.course.getCommentDelegate(arg); }; };

        Vue.$api = Vue.prototype.$api = this.models;
    };
};
