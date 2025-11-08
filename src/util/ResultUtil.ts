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
        if (result && Array.isArray(result.content)) {
            const textItem = result.content.find((c: any) => c && c.type === 'text' && typeof c.text === 'string');
            if (textItem && textItem.text) {
                const parsed = this.parseJsonSafely(textItem.text);
                return parsed.ok ? parsed.value : parsed.value;
            }
        }
        return result;
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