class myPromise {
    constructor (exector) {
        // 初始化值
        this.initValue()
        // 初始化this指向
        this.initBind()
        try {
            // 执行传进来的函数
            exector(this.resolve, this.reject)
        } catch (e) {
            // 捕捉到错误直接执行reject
            this.reject(e)
        }  
    }
    initBind () {
        // 初始化this
        this.resolve = this.resolve.bind(this)
        this.reject = this.reject.bind(this)
    }
    initValue () {
        // 初始化值
        this.PromiseResult = null // 终值
        this.PromiseState = 'pending' // 状态
        this.onFulfilledCallbacks = [] // 保存成功回调
        this.onRejectedCallbacks = [] // 保存失败回调
    }
    resolve (value) {
        // state是不可变的，以第一次执行的为准
        if (this.PromiseState !== 'pending') return
        // 如果执行resolve，状态变为fulfilled
        this.PromiseState = 'fulfilled'
        // 终值为传进来的值
        this.PromiseResult = value
        // 执行保存的成功回调
        while (this,this.onFulfilledCallbacks.length) {
            this.onFulfilledCallbacks.shift()(this.PromiseResult)
        }
    }
    reject (reason) {
        // state是不可变的，以第一次执行的为准
        if (this.PromiseState !== 'pending') return
        // 如果执行reject，状态变为rejected
        this.PromiseState = 'rejected'
        // 终值为传进来的reason
        this.PromiseResult = reason
        // 执行保存的失败回调
        while (this,this.onRejectedCallbacks.length) {
            this.onRejectedCallbacks.shift()(this.PromiseResult)
        }
    }
    then (onFulfilled, onRejected) {
        // 接收两个回调onFulfilled，onRejected
        // 参数校验，确保一定是函数
        onFulfilled = typeof onFulfilled === 'function' ? onFulfilled : val => val
        onRejected = typeof onRejected === 'function' ? onRejected : reason => { throw reason }
        let thenPromise = new myPromise((resolve, reject) => {
            const resolvePromise = cb => {
                setTimeout(() => {
                    try {
                        const x = cb(this.PromiseResult)
                        if (x === thenPromise) {
                            // 不能返回自身
                            throw new Error('不能返回自身。。。')
                        }
                        if (x instanceof myPromise) {
                            // 如果返回值是Promise
                            // 如果返回值是promise对象，返回值为成功，新promise就是成功
                            // 如果返回值是promise对象，返回值为失败，新promise就是失败
                            // 谁知道返回的promise是失败成功？只有then知道
                            x.then(resolve, reject)
                        } else {
                            // 非Promise就直接成功
                            resolve(x)
                        }
                    } catch (err) {
                        // 处理报错
                        reject(err)
                    }
                })
            }
            if (this.PromiseState === 'fulfilled') {
                // 如果当前为成功状态，执行第一个回调
                resolvePromise(onFulfilled)
                // onFulfilled(this.PromiseResult)
            } else if (this.PromiseState === 'rejected') {
                // 如果当前为失败状态，执行第二个回调函数
                // onRejected(this.PromiseResult)
                resolvePromise(onRejected)
            } else if (this.PromiseState === 'pending') {
                // 如果状态为待定状态，暂时保存两个回调
                // this.onFulfilledCallbacks.push(onFulfilled.bind(this))
                // this.onRejectedCallbacks.push(onRejected.bind(this))
                this.onFulfilledCallbacks.push(resolvePromise.bind(this, onFulfilled))
                this.onRejectedCallbacks.push(resolvePromise.bind(this, onRejected))
            }
        })
        // 返回这个包装的Promise
        return thenPromise
    }
    static all (promises) {
        const result = []
        let count = 0
        return new myPromise((resolve, reject) => {
            const addData = (index, value) => {
                result[index] = value
                count++
                if (count === promises.length) resolve(result)
            }
            promises.forEach((promise, index) => {
                if (promise instanceof myPromise) {
                    promise.then(res => {
                        addData(index, res)
                    }, err => reject(err))
                } else {
                    addData(index, promise)
                }
            }) 
        })
    }
    static race (promises) {
        return new myPromise((resolve, reject) => {
            promises.forEach(promise => {
                if (promise instanceof myPromise) {
                    promise.then(res => {
                        resolve(res)
                    }, err => {
                        reject(err)
                    })
                } else {
                    resolve(promise)
                }
            })
        })
    }
}