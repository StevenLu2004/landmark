import Vue from 'vue/dist/vue.esm.js';
import io from 'socket.io-client/dist/socket.io.js';
import Components from './components.js';

// Register components
Vue.component("directory", Components.Directory.template);
Vue.component("folder", Components.Folder.template);
Vue.component("file", Components.File.template);

// Initialize external reference to explorer data
let explorerData = {
    title: "Explorer",
    debug: false,
    directory: new Components.Directory(),
};

// Debug test
console.log(JSON.stringify(explorerData));

// Create global fields
let explorer, pExplorer, socket;

// Create explorer
var createExplorer = () => {
    explorer = new Vue({
        el: "#explorer",
        data: explorerData,
        mounted: function () {
            this.update();
        },
        methods: {
            update: function () {
                var app = this;
                var xhttp = new XMLHttpRequest();
                xhttp.onreadystatechange = function () {
                    if (this.readyState == 4 && this.status == 200) {
                        var res = this.responseText;
                        app.directory = JSON.parse(res);
                    }
                };
                xhttp.open("GET", "explorer", true);
                xhttp.send();
            },
        }
    });
};

// Create p-explorer
var createPExplorer = () => {
    pExplorer = new Vue({
        el: "#p-explorer",
        data: {
            files: [],
        },
        mounted: function () {
            socket = io(`http://${location.hostname}:${3001}`);
            var app = this;
            socket.on("update", () => {
                app.update();
                // alert();
            });
            this.update();
        },
        methods: {
            update: function () {
                var app = this;
                var xhttp = new XMLHttpRequest();
                xhttp.onreadystatechange = function () {
                    if (this.readyState == 4 && this.status == 200) {
                        var res = this.responseText;
                        app.files = JSON.parse(res);
                    }
                };
                xhttp.open('GET', "/peripheral/files", true);
                xhttp.send();
            }
        }
    });
};

window.onload = () => {
    if (document.getElementById("explorer")) createExplorer();
    if (document.getElementById("p-explorer")) createPExplorer();
};
