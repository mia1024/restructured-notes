declare module 'font-scanner' {
    export interface FontDescriptor {
        readonly path: string;
        readonly style: string;
        readonly width: number;
        readonly family: string;
        readonly weight: number;
        readonly italic: boolean;
        readonly monospace: boolean;
        readonly postscriptName: string;
    }

    export interface QueryFontDescriptor {
        readonly path?: string;
        readonly style?: string;
        readonly width?: number;
        readonly family?: string;
        readonly weight?: number;
        readonly italic?: boolean;
        readonly monospace?: boolean;
        readonly postscriptName?: string;
    }
    export function getAvailableFontsSync(): FontDescriptor[];
    export function getAvailableFonts(): Promise<FontDescriptor[]>;
    export function findFontsSync(fontDescriptor?: QueryFontDescriptor): FontDescriptor[];
    export function findFonts(fontDescriptor?: QueryFontDescriptor):Promise<FontDescriptor[]>;
    export function findFontSync(fontDescriptor: QueryFontDescriptor): FontDescriptor;
    export function findFont(fontDescriptor?: QueryFontDescriptor):Promise<FontDescriptor>;
    export function substituteFontSync(postscriptName: string, text: string): FontDescriptor;
    export function substituteFont(postscriptName: string, text: string):Promise<FontDescriptor>;
}