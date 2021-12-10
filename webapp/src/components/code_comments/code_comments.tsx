import { Client4 } from 'mattermost-redux/client';
import { Post } from 'mattermost-redux/types/posts';
import React from 'react';

export type Props = {
    currentUserId: string;
    channel: string;
    thread: string;
    file: string;
    line?: number;
    comments: Post[];
    getLineContext: (n: number) => string
};

type State = {
    visible: boolean;
    draftValue: string;
    contextLines: number;
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
            draftValue: "",
            contextLines: 1
        };
    }

    setDraftValue(draftValue: string) {
        this.setState({draftValue});
    }

    addComment() {
        let context = this.props.getLineContext(this.state.contextLines);

        Client4.createPost({
            channel_id: this.props.channel,
            message: `**${this.props.file}:${this.props.line}:** ${context}${this.state.draftValue}`,
            root_id: this.props.thread
        } as Post);
        this.setDraftValue('');
    }

    handleContextLinesChange(event: React.ChangeEvent) {
        let lines = parseInt((event.target as HTMLInputElement).value)
        if (lines >= 0 && lines <= (this.props.line || 0)) {
            this.setState({contextLines: lines})
        }
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
                            id="CodeReview-Comments-create-textbox"
                            value={this.state.draftValue}
                            emojiEnabled={false}
                            supportsCommands={false}
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
                        <div
                            style={{float: 'right', fontSize: 'small', textAlign: 'right'}}>
                            Lines of context:
                            <input
                                type="number"
                                value={this.state.contextLines}
                                onChange={(e: React.ChangeEvent) => this.handleContextLinesChange(e)}
                                className="form-control"
                                style={{width: '4em', display: 'inline-block', margin: '6px'}}/>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}