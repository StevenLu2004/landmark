var Directory = function () {
    this.folders = [];
    this.files = [];
    return this;
};

var Folder = function (name) {
    this.name = name;
    this.contents = new Directory();
    this.path = "/";
    return this;
};

var File = function (name) {
    this.name = name;
    this.path = "/";
    return this;
};

Directory.template = {
    props: ["directory"],
    template: `
    <ul>
        <folder v-for='folder in directory.folders' v-bind:folder='folder' />
        <file v-for='file in directory.files' v-bind:file='file' />
    </ul>`,
    data: function () {
        return {
            directory: new Directory(),
        };
    },
    methods: {},
};

Folder.template = {
    props: ["folder"],
    template: `
    <li>
        <p><button v-on:click='toggleExpand'>{{ expanded ? 'v' : '>' }}</button> {{ folder.name }}</p>
        <directory v-if='expanded' v-bind:directory='folder.contents' />
    </li>`,
    data: function () {
        return {
            folder: new Folder(""),
            expanded: false,
        };
    },
    methods: {
        toggleExpand: function () {
            this.expanded = !this.expanded;
        },
    },
};

File.template = {
    props: ["file"],
    template: `
    <li>
        <p>
            <a v-bind:href='"/" + file.path' download>&darr;</a>
            <a v-bind:href='"/" + file.path' target='_blank'>{{ file.name }}</a>
        </p>
    </li>`,
    data: function () {
        return {
            file: new File(""),
        };
    },
};

module.exports = {
    Directory: Directory,
    Folder: Folder,
    File: File,
};
