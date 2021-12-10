import {connect} from 'react-redux';

import {GlobalState} from 'mattermost-redux/types/store';
import {getTheme} from 'mattermost-redux/selectors/entities/preferences';

import CodeReview from './code_review';
import { Post } from 'mattermost-redux/types/posts';
import { makeGetPostsForThread } from 'mattermost-redux/selectors/entities/posts';
import { Props } from 'components/code_review/code_review';

const mapStateToProps = (state: GlobalState, ownProps: Omit<Props, 'comments'>) => {
    const comments: {[key:string]: Post[]} = {};
    const commentRegex = new RegExp(`^\\\*\\\*${ownProps.fileInfo.name}:(\\d+):\\\*\\\*`);
    const posts = makeGetPostsForThread()(state, {rootId: ownProps.post.id});
    for (let post of posts) {
        const match = post.message.match(commentRegex)
        if (match) {
            (comments[match[1]] = comments[match[1]] || []).push(post);
        }
    }

    for (let line of Object.keys(comments)) {
        comments[line].sort((a: Post, b: Post) => a.create_at-b.create_at)
    }

    return {
        theme: getTheme(state),
        comments: comments
    }
};

export default connect(mapStateToProps)(CodeReview);