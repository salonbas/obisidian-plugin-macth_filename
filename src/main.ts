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

                    // 將檔名按空格分割成多個關鍵字，並過濾掉空字串和太短的關鍵字
                    const keywords = file.basename
                        .split(/\s+/)
                        .filter(kw => kw && kw.length >= 2);
                    
                    if (keywords.length === 0) return Decoration.none;

                    // 先收集所有匹配結果
                    const matches: Array<{ start: number; end: number }> = [];
                    
                    for (let { from, to } of view.visibleRanges) {
                        const text = view.state.doc.sliceString(from, to);
                        
                        // 對每個關鍵字進行匹配
                        for (const keyword of keywords) {
                            const regex = new RegExp(this.escapeRegExp(keyword), 'gi');
                            
                            let match;
                            while ((match = regex.exec(text)) !== null) {
                                const start = from + match.index;
                                const end = start + match[0].length;
                                
                                matches.push({ start, end });
                            }
                        }
                    }
                    
                    // 按 start 位置排序，確保按順序添加到 builder
                    matches.sort((a, b) => a.start - b.start);
                    
                    // 按順序添加到 builder
                    for (const { start, end } of matches) {
                        builder.add(
                            start,
                            end,
                            Decoration.mark({
                                class: "cm-filename-highlight"
                            })
                        );
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

