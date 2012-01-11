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
        var tail = this.handlers.slice(-1)[0];
        // 直近のハンドラにresolvedが未登録なら再追加
        if (tail && !tail.resolved) {
            tail.resolved = resolvedHandler;
            this.handlers.pop();
            this.handlers.push(tail);
        } else {
            this.then(resolvedHandler);
        }
    }

    /**
     * 棄却ハンドラの登録
     * @param {Function} rejectedHandler
     */
    function PromiseFail(rejectedHandler) {
        var tail = this.handlers.slice(-1)[0];
        // 直近のハンドラにrejectedが未登録なら再追加
        if (tail && !tail.rejected) {
            tail.rejected = rejectedHandler;
            this.handlers.pop();
            this.handlers.push(tail);
        } else {
            this.then(void 0, rejectedHandler);
        }
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
     * ハンドラの呼び出し
     * @param {String} state
     * @param {Arguments} args
     * @return {void}
     */
    function PromiseCall(state, args) {
        var handlers = this.handlers, handler, rv;

        if ('progress' === state) {
           handlers[0] && (handler = handlers[0].progress) && handler.apply(this, args);
        } else {
            // 解決時のステートを保存
            this.resolved = state;
            while (handler = handlers.splice(0, 1)[0]) {
                handler = handler[state];
                rv = handler ? handler.apply(this, args) : rv;

                // Promiseが得られたら，残りのハンドラを渡してリレーする
                if (rv instanceof Promise) {
                    rv.relay(this);
                    break;
                }
            }
        }
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
        // 解決時ステートで，relayしたハンドラをすぐにcallする
        if (!!this.isResolved) {
            this.call(this.resolved);
        }
    }

    /**
     * 解決済みかどうかを返す
     * @return {Boolean}
     */
    function PromiseIsResolved() {
        return !!this.resolved();
    }

    // define
    root.Stay = Promise;

    // prototypes
    Promise.prototype.then     = PromiseThen;
    Promise.prototype.done     = PromiseDone;
    Promise.prototype.fail     = PromiseFail;

    Promise.prototype.resolve  = PromiseResolve;
    Promise.prototype.reject   = PromiseReject;
    Promise.prototype.progress = PromiseProgress;
    Promise.prototype.call     = PromiseCall;
    Promise.prototype.relay    = PromiseRelay;

    Promise.prototype.isResolved = PromiseIsResolved;


})(window || this); // window or global