// Copyright (C) 2020 Chris Younger

var alertme_app_name = "highlighter_example";

(function() {
	var mode = "min";
	require.config({
		paths: {
			'vs': '../app/' + alertme_app_name + '/node_modules/monaco-editor/'+mode+'/vs',
		}
	});
	var scripts = document.getElementsByTagName("script");
	var src = scripts[scripts.length-1].src;
// The splunk webserver prepends all scripts with a call to i18n_register() for internationalisation. This fails for web-workers becuase they dont know about this function yet.
	window.MonacoEnvironment = {
		getWorkerUrl: function(workerId, label) {
			return "data:text/javascript;charset=utf-8," + encodeURIComponent(
				//"console.log('shimming i18n_register for worker'); "+
				"function i18n_register(){/*console.log('i18n_register shimmed');*/} "+
				"self.MonacoEnvironment = { baseUrl: '" + window.location.origin + "/static/app/" + alertme_app_name + "/node_modules/monaco-editor/"+mode+"/' }; "+
				"importScripts('" + window.location.origin + "/static/app/" + alertme_app_name + "/node_modules/monaco-editor/"+mode+"/vs/base/worker/workerMain.js');"
			);
		}
	};
})();

require([
	"vs/editor/editor.main",
	"jquery",
	"app/" + alertme_app_name + "/spl_language",
	"splunkjs/mvc", 
	"splunkjs/mvc/simplexml/ready!"
], function (
	undefined, 
	$,
	spl_language,
	mvc
) {
	var defaultTokenModel = mvc.Components.get("default", {create: true});

	// Setup the search editor textarea
	monaco.editor.defineTheme('vs-dark-spl', {
		base: 'vs-dark',
		inherit: true,
		rules: [
			{ token: 'function', foreground: 'c586c0' }, // pink
			{ token: 'command', foreground: '569cd6', fontStyle: 'bold' }, // blue - make bold?
			{ token: 'pipe', foreground: 'd4d4d4', fontStyle: 'bold' }, // white bold
			{ token: 'argument', foreground: '3dc9b0' }, // teal
			{ token: 'keyword', foreground: 'dd6a6f' }, // normal  AND|OR|WHERE etc
			{ token: 'operator', foreground: 'd4d4d4' }, // red
			{ token: 'string', foreground: 'ce9178' }, // orange
			{ token: 'number', foreground: 'b5cea8' }, // green
			{ token: 'delimiter', foreground: 'DCDCDC' }, // gray
			{ token: 'invalid', foreground: 'FF0000' }, // red
			{ token: 'macro.comment', foreground: '608B4E' }, // green
			{ token: 'macro.comment.wrap', foreground: '808080' }, // grey
			{ token: 'macro.args', foreground: '74B0DF' }, // macro args
			{ token: 'macro.function', foreground: '9CDCFE' }, // macro name
		]
	});
	monaco.languages.register({id: 'spl'});
	monaco.languages.setMonarchTokensProvider('spl', spl_language.lang);

	var model = monaco.editor.createModel("");
	var editor = monaco.editor.create($(".search_query_box")[0], {
		automaticLayout: true,
		model: model,
		scrollBeyondLastLine: false,
		wordWrap: "on",
		lineNumbers: 'off',
		glyphMargin: false,
		folding: false,
		minimap: {enabled: false}
	});
	monaco.editor.setTheme("vs-dark-spl");
	monaco.editor.setModelLanguage(model, "spl");
	editor.onDidChangeModelContent(function() {
		// set token $query$ when the textarea contents changes 
		defaultTokenModel.set("query", editor.getValue());
	});

	//editor.setValue("some new content");
});
