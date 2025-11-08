/**
 *
 */
export class ResultUtil {

    /**
     * 安全に JSON をパースするヘルパー
     * @param {string} text JSON 文字列またはプレーンテキスト
     * @returns {{ok: boolean, value: any}}
     */
    public static parseJsonSafely(text: string) {
        try {
            return { ok: true, value: JSON.parse(text) };
        } catch (e) {
            return { ok: false, value: text };
        }
    }

    /**
     * result から出力対象を抽出する
     * @param {any} result
     * @returns {any}
     */
    public static extractOutputFromResult(result: any) {
        if (!(result && Array.isArray(result.content))) return result;

        // まず error を優先して探す
        const errMsg = this.extractErrorMessageFromContent(result.content);
        if (errMsg) return errMsg;

    // 次に json タイプがあればその json を返す
    const jsonItem = result.content.find((c: any) => c && c.type === 'json' && c.json !== undefined);
    if (jsonItem) return jsonItem.json;

        // 次に最初の text を探して JSON をパースして返す
        const textItem = result.content.find((c: any) => c && c.type === 'text' && typeof c.text === 'string');
        if (!textItem) return result;
        return this.parseJsonSafely(textItem.text).value;
    }

    /**
     * content 配列から error を探して整形された文字列を返す
     * 見つからなければ undefined を返す
     * @param {any[]} content
     * @returns {string|undefined}
     */
    private static extractErrorMessageFromContent(content: any[]): string | undefined {
        if (!Array.isArray(content)) return undefined;
        const err = content.find((c: any) => c && c.type === 'error' && c.error && typeof c.error.message === 'string');
        if (!err) return undefined;
        const message = err.error.message;
        const code = err.error.code;
        return typeof code === 'string' && code.length > 0 ? `${message} (${code})` : message;
    }

    /**
     * result オブジェクトから content 内の text を取り出して出力する
     * @param {any} result
     */
    public static printResult(result: any) {
        try {
            const output = this.extractOutputFromResult(result);
            if (typeof output === 'string') {
                console.log(output);
            } else {
                console.log(JSON.stringify(output, null, 2));
            }
        } catch (e) {
            console.log(JSON.stringify(result, null, 2));
        }
    }
}