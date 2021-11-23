import { Client4 } from 'mattermost-redux/client';
import { Post, PostList, PostType } from 'mattermost-redux/types/posts';
import React from 'react';

export type Props = {
    currentUserId: string;
    thread: string;
    file: string;
    line?: number;
    comments: Post[];
};

type State = {
    visible: boolean;
    draftValue: string;
};

const Avatar = (window as any).Components.Avatar;
const Textbox = (window as any).Components.Textbox;
const imageURLForUser = (window as any).Components.imageURLForUser;
const formatText = (window as any).PostUtils.formatText;

export default class CodeComments extends React.PureComponent<Props, State> {

    constructor(props: Props) {
        super(props);

        this.state = {
            visible: false,
            draftValue: ""
        };
    }

    setDraftValue(draftValue: string) {
        this.setState({draftValue});
    }

    addComment() {
        this.props.comments.push({ // TODO: the real thing
            id:'',create_at:0,update_at:0,edit_at:0,delete_at:0,is_pinned:false,user_id:this.props.currentUserId,channel_id:'',root_id:'',parent_id:'',original_id:'',
            message:this.state.draftValue,
            type:'system_channel_deleted',props:{},hashtags:'',pending_post_id:'',reply_count:0,metadata:{embeds:[],emojis:[],files:[],images:{},reactions:[]}
        });
        this.setDraftValue('');
    }

    renderComments() {
        const comments = [];
        for (let comment of this.props.comments) {
            const message = comment.message.replace(`**${this.props.file}:${this.props.line}:**`, '');
            comments.push(<div key={`${comment.id}`} className="CodeReview-Comments-comment">
                    <Avatar size="xs" url={imageURLForUser(comment.user_id)}/>
                    <div dangerouslySetInnerHTML={{__html: formatText(message)}}></div>
                </div>);
        }

        return comments;
    }

    render() {

        if (!this.props.line) {
            return null;
        }

        return (
            <div className="CodeReview-Comments">
                <div className="CodeReview-Comments-header">
                    <span>
                        <span>Comments</span><div>Line {this.props.line}</div>
                    </span>
                </div>
                <div className="CodeReview-Comments-body">
                    {this.renderComments()}
                    <div className="CodeReview-Comments-create">
                        <Textbox
                            value={this.state.draftValue}
                            emojiEnabled={true}
                            supportsCommands={true}
                            useChannelMentions={true}
                            onChange={(e: React.ChangeEvent) => {this.setDraftValue((e.target as any).value)}}
                            characterLimit={1000}
                            createMessage="Add a comment..."
                            onKeyPress={() => {}}
                            openWhenEmpty={true}
                            channelId={''}/>
                        <input
                            type="button"
                            className="btn btn-primary comment-btn"
                            value="Add Comment"
                            onClick={(e: React.MouseEvent) => this.addComment()}/>
                    </div>
                </div>
            </div>
        );
    }
}