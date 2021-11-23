import {connect} from 'react-redux';

import {GlobalState} from 'mattermost-redux/types/store';
import {getTheme} from 'mattermost-redux/selectors/entities/preferences';
import {getCurrentUserId} from 'mattermost-redux/selectors/entities/users';
import {makeGetPostsForThread} from 'mattermost-redux/selectors/entities/posts';

import {Props} from './code_comments';
import CodeComments from './code_comments';
import { Post } from 'mattermost-redux/types/posts';

const getPostsForThread = makeGetPostsForThread();

const mapStateToProps = (state: GlobalState, ownProps: Omit<Props, 'currentUserId' | 'comments'>) => {
    const comments: Post[] = [];
    if (ownProps.line) {
        const commentRegex = new RegExp(`^\\\*\\\*${ownProps.file}:${ownProps.line}:\\\*\\\*`);
        const posts = getPostsForThread(state, {rootId: ownProps.thread});
        for (let post of posts) {
            if (commentRegex.test(post.message)) {
                comments.push(post);
            }
        }
    }

    return {
        theme: getTheme(state),
        currentUserId: getCurrentUserId(state),
        comments: comments.sort((a: Post, b: Post) => a.create_at-b.create_at)
    }
};

export default connect(mapStateToProps, null, null, {forwardRef: true})(CodeComments);