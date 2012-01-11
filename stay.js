/**
 * Stay.js
 *
 * @see http://wiki.commonjs.org/wiki/Promises/A
 *
 * Copyright (c) 2012 Ayumu Sato ( http://havelog.ayumusato.com )
 *
 * Licensed under the MIT license:
 *  http://www.opensource.org/licenses/mit-license.php
 */
(function(root) {

    "use strict";

    /**
     * @constructor
     */
    function Promise() {
        this.handlers = [];
        this.resolved = false;
    }

    /**
     * ハンドラ類を登録
     * @param {Function} [resolvedHandler]
     * @param {Function} [rejectedHandler]
     * @param {Function} [progressHandler]
     * @return {Promise}
     */
    function PromiseThen(resolvedHandler, rejectedHandler, progressHandler) {
        this.handlers.push({
            resolved : resolvedHandler,
            rejected : rejectedHandler,
            progress : progressHandler
        });
        return this;
    }

    /**
     * 解決ハンドラの登録
     * @param {Function} resolvedHandler
     */
    function PromiseDone(resolvedHandler) {
        this.then(resolvedHandler);
    }

    /**
     * 棄却ハンドラの登録
     * @param {Function} rejectedHandler
     */
    function PromiseFail(rejectedHandler) {
        this.then(void 0, rejectedHandler);
    }

    /**
     * 解決ハンドラの呼び出し
     * @return {void}
     */
    function PromiseResolve() {
        this.call('resolved', arguments);
    }

    /**
     * 棄却ハンドラの呼び出し
     * @return {void}
     */
    function PromiseReject() {
        this.call('rejected', arguments);
    }

    /**
     * 実行中ハンドラの呼び出し
     * @return {void}
     */
    function PromiseProgress() {
        this.call('progress', arguments);
    }

    /**
     * oldPromiseからnewPromise(this)にハンドラを引き継ぎ
     * @param oldPromise
     * @return {void}
     */
    function PromiseRelay(oldPromise) {
        this.handlers = oldPromise.handlers;
        oldPromise.handlers = [];

        // もしnewPromiseがすぐに解決済みのオブジェクトになっていたら
        // 解決済みステートで，relayしたハンドラをすぐにcallする
        if (!!this.resolved) {
            this.call(this.resolved);
        }
    }

    /**
     * ハンドラの呼び出し
     * @param {String} state
     * @param {Arguments} args
     * @return {void}
     */
    function PromiseCall(state, args) {
        var handlers = this.handlers, handler, rv, i = 0, iz = handlers.length;

        if ('progress' === state) {
            (handler = handlers[0].progress) && handler.apply(this, args);
        } else {
            // 解決時のステートを保存
            this.resolved = state;
            for (; i<iz; i++) {
                handler = handlers.splice(0, 1)[0][state];
                rv = handler ? handler.apply(this, args) : rv;

                // Promiseが得られたら，残りのハンドラを渡してリレーする
                if (rv instanceof Promise) {
                    rv.relay(this);
                    break;
                }
            }
        }
    }

    Promise.prototype.done     = PromiseDone;
    Promise.prototype.fail     = PromiseFail;
    Promise.prototype.then     = PromiseThen;
    Promise.prototype.resolve  = PromiseResolve;
    Promise.prototype.reject   = PromiseReject;
    Promise.prototype.progress = PromiseProgress;
    Promise.prototype.relay    = PromiseRelay;
    Promise.prototype.call     = PromiseCall;

    root.Stay = Promise;

})(window || this); // window or global