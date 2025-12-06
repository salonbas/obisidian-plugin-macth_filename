import { Plugin } from 'obsidian';
import { Extension, RangeSetBuilder } from '@codemirror/state';
import {
    Decoration,
    DecorationSet,
    EditorView,
    ViewPlugin,
    ViewUpdate,
} from '@codemirror/view';

export default class FilenameHighlighterPlugin extends Plugin {
    async onload() {
        console.log('Filename Highlighter Plugin loaded');
        
        // 註冊 Editor Extension
        this.registerEditorExtension(this.buildHighlighter());
    }

    onunload() {
        console.log('Filename Highlighter Plugin unloaded');
    }

    buildHighlighter(): Extension {
        const plugin = this;
        
        const highlighterPlugin = ViewPlugin.fromClass(
            class HighlighterViewPlugin {
                decorations: DecorationSet;

                constructor(view: EditorView) {
                    this.decorations = this.buildDecorations(view);
                }

                update(update: ViewUpdate) {
                    if (update.docChanged || update.viewportChanged) {
                        this.decorations = this.buildDecorations(update.view);
                    }
                }

                buildDecorations(view: EditorView): DecorationSet {
                    const builder = new RangeSetBuilder<Decoration>();
                    
                    const app = plugin.app;
                    if (!app) return Decoration.none;
                    
                    const file = app.workspace.getActiveFile();
                    if (!file) return Decoration.none;

                    const keyword = file.basename;
                    if (!keyword || keyword.length < 2) return Decoration.none;

                    for (let { from, to } of view.visibleRanges) {
                        const text = view.state.doc.sliceString(from, to);
                        const regex = new RegExp(this.escapeRegExp(keyword), 'gi');
                        
                        let match;
                        while ((match = regex.exec(text)) !== null) {
                            const start = from + match.index;
                            const end = start + match[0].length;

                            builder.add(
                                start,
                                end,
                                Decoration.mark({
                                    class: "cm-filename-highlight"
                                })
                            );
                        }
                    }

                    return builder.finish();
                }

                escapeRegExp(string: string): string {
                    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                }
            },
            {
                decorations: (v) => v.decorations,
            }
        );

        return [highlighterPlugin];
    }
}

