/**
 *
 */
export class Logger {

    /**
     * ログを出力します
     * @param {string} level ログレベル
     * @param {string} message ログに出力するメッセージ
     * @param {...any} optionalParams ログに出力する追加のパラメータ
     */
    public static log(level: string,message: string, ...optionalParams: any[]) {
        console.error(`[${level}] ${message}`, ...optionalParams);
    }

    /**
     * ログを出力します
     * @param {string} message ログに出力するメッセージ
     * @param {...any} optionalParams ログに出力する追加のパラメータ
     */
    public static info(message: string, ...optionalParams: any[]) {
        this.log('Info', message, ...optionalParams);
    }
    
    /**
     * ログを出力します
     * @param {string} message ログに出力するメッセージ
     * @param {...any} optionalParams ログに出力する追加のパラメータ
     */
    public static error(message: string, ...optionalParams: any[]) {
        this.log('Error', message, ...optionalParams);
    }
}