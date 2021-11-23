export interface PluginRegistry {
    registerPostTypeComponent(typeName: string, component: React.ElementType)
    registerFilePreviewComponent(override: (fileInfo, post) => boolean, component: React.ElementType)

    // Add more if needed from https://developers.mattermost.com/extend/plugins/webapp/reference
}
