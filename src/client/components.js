var Directory = function() {
    this.folders = [];
    this.files = [];
    return this;
};

var Folder = function(name) {
    this.name = name;
    this.contents = new Directory();
    return this;
};

var File = function(name) {
    this.name = name;
    return this;
};

Directory.template = {
    props: ["directory"],
    template: "<ul>\
    <folder v-for='folder in directory.folders' v-bind:folder='folder' />\
    <file v-for='file in directory.files' v-bind:file='file' />\
    </ul>",
    // template: "<ul>\
    // <li>{{ directory }} ({{ directory == undefined }}) : {{ JSON.stringify(directory) }}</li>\
    // </ul>",
    data: function() {
        return {
            directory: new Directory(),
        };
    },
    methods: {},
};

Folder.template = {
    props: ["folder"],
    template: "<li>\
    <p>{{ folder.name }} <button v-on:click='toggleExpand'>{{ expanded ? 'collapse' : 'expand' }}</button></p>\
    <directory v-if='expanded' v-bind:directory='folder.contents' />\
    </li>",
    // template: "<li><p>{{folder.name}}</p></li>",
    data: function() {
        return {
            expanded: false,
            loaded: false,
        };
    },
    methods: {
        toggleExpand: function() {
            this.expanded = !this.expanded;
        },
    },
};

File.template = {
    props: ["file"],
    template: "<li>\
    <p>{{file.name}}</p>\
    </li>",
    data: function() {
        return {
            // TODO
        };
    },
};

module.exports = {
    Directory: Directory,
    Folder: Folder,
    File: File,
};
