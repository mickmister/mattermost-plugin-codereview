import React from 'react';

import {FileInfo} from 'mattermost-redux/types/files';
import {Client4} from 'mattermost-redux/client';
import {Theme} from 'mattermost-redux/types/preferences';
import hlJS from 'highlight.js';
import {getFileUrl} from "mattermost-redux/utils/file_utils";
import { Post, PostList } from 'mattermost-redux/types/posts';

import './code_review.css';
import CodeComments from 'components/code_comments';

export type Props = {
    fileInfo: FileInfo;
    post: Post;
    onModalDismissed: () => void;
    theme: Theme;
    comments: { [key:string]: Post[] }
};

type State = {
    code: string;
    comments?: PostList;
    lang: string;
    loading: boolean;
    success: boolean;
    prevFileId?: string;
    line?: number;
};

const Avatar = (window as any).Components.Avatar;
const imageURLForUser = (window as any).Components.imageURLForUser;

export default class CodeReview extends React.PureComponent<Props, State> {

    static MAX_FILE_SIZE = 500000;

    static SupportedFiles: { [extension: string]: any } = {
        diff: {name: 'Diff'},
        patch: {name: 'Diff'},
    }

    static getDerivedStateFromProps(props: Props, state: State) {
        if (props.fileInfo.id !== state.prevFileId) {
            const usedLanguage = props.fileInfo.extension in CodeReview.SupportedFiles ? props.fileInfo.extension : undefined;

            if (!usedLanguage || props.fileInfo.size > CodeReview.MAX_FILE_SIZE) {
                return {
                    code: '',
                    lang: '',
                    loading: false,
                    success: false,
                    prevFileId: props.fileInfo.id,
                };
            }

            return {
                code: '',
                lang: usedLanguage,
                loading: true,
                prevFileId: props.fileInfo.id,
            };
        }
        return null
    }

    constructor(props: Props) {
        super(props);

        this.state = {
            code: '',
            lang: '',
            loading: true,
            success: true,
        };
    }

    componentDidMount() {
        this.load();
    }

    load = async () => {
        try {
            const fileInfo = this.props.fileInfo;
            const fileUrl = getFileUrl(fileInfo.id);
            if (!this.state.lang || fileInfo.size > CodeReview.MAX_FILE_SIZE) {
                return;
            }
            const codeResponse = await fetch(fileUrl);;
            const code = await codeResponse.text();
            this.handleReceivedCode(code);
        } catch (e) {
            this.handleReceivedError();
        }
    }

    handleReceivedCode = (code: string) => {
        this.setState({
            code,
            loading: false,
            success: true,
        });
    }

    handleReceivedError = () => {
        this.setState({loading: false, success: false});
    }

    static supports(fileInfo: FileInfo, post: Post) {
        const isSupportedFile = fileInfo.extension in CodeReview.SupportedFiles;
        const isRootPost = post.root_id === "";
        return isSupportedFile && isRootPost;
    }

    handleMouseMove(event: React.MouseEvent<HTMLDivElement>) {
        const target = event.currentTarget;

        for (let line of target.parentElement!.querySelectorAll('.CodeReview-LineOverlay')) {
            let element = line as HTMLElement;
            element.classList.remove('CodeReview-LineOverlay-focused');
        }

        if (target.classList.contains('CodeReview-LineOverlay')) {
            target.classList.add('CodeReview-LineOverlay-focused');
        }
    }

    getLineContext(n: number): string {
        if (!this.state.line || !n) {
            return '';
        }

        const lines = this.state.code.split(/\r\n|\n|\r/g).slice(this.state.line-n, this.state.line).join('\n');
        if (lines === '') {
            return '';
        }
        return '\n```' + this.props.fileInfo.extension + '\n' + lines + '\n```\n'
    }

    renderLineOverlays() {
        const numberOfLines = this.state.code.split(/\r\n|\n|\r/g).length;
        const lineOverlays = [];
        for (let i = 1; i <= numberOfLines; i++) {
            const classes = [ 'CodeReview-LineOverlay' ];
            if (this.props.comments[i]?.length > 0) {
                classes.push('CodeReview-LineOverlay-commented');
            }
            lineOverlays.push(<React.Fragment key={i}>
                    <span>{i.toString()}</span>
                    <div className={classes.join(' ')}
                        onMouseMove={this.handleMouseMove}>
                    </div>
                    <button onClick={(e: React.MouseEvent) => {
                            this.setState({line: i});
                        }}>
                        {this.props.comments[i]?.length > 0 ? <Avatar size="xs" url={imageURLForUser(this.props.comments[i][0].user_id)}/> : '💬'}
                    </button>
                    <br/>
                </React.Fragment>);
        }
        return lineOverlays;
    }

    render() {
        if (this.state.loading) {
            return (
                <div className='view-image__loading'/>
            );
        }

        const fileInfo = this.props.fileInfo;
        const highlighted = hlJS.highlight(this.state.code, {language:this.state.lang}).value;

        return (
                <div className='CodeReview post-code code-preview'>
                    <CodeComments
                        channel={this.props.post.channel_id}
                        thread={this.props.post.id}
                        file={this.props.fileInfo.name}
                        line={this.state.line}
                        getLineContext={(n: number) => this.getLineContext(n)}/>
                    <span className='post-code__language'>
                        {`${fileInfo.name} - ${CodeReview.SupportedFiles[fileInfo.extension].name}`}
                    </span>
                    <div className='hljs'>
                        <div className='post-code__line-numbers'>
                            {this.renderLineOverlays()}
                        </div>
                        <code dangerouslySetInnerHTML={{__html: highlighted}}/>
                    </div>
                </div>
        );
    }
}
