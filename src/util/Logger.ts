export enum LogLevels {
    Debug,
    Info,
    Error
}
/**
 *
 */
export class Logger {

    public static levels: LogLevels = LogLevels.Info;

    /**
     * ログを出力します
     * @param {string} level ログレベル
     * @param {string} message ログに出力するメッセージ
     * @param {...any} optionalParams ログに出力する追加のパラメータ
     */
    public static log(level: string, message: string, ...optionalParams: any[]) {
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

    /**
     * ログを出力します
     * @param {string} message ログに出力するメッセージ
     * @param {...any} optionalParams ログに出力する追加のパラメータ
     */
    public static debug(message: string, ...optionalParams: any[]) {
        if (this.levels > LogLevels.Debug) return;
        this.log('Debug', message, ...optionalParams);
    }
}