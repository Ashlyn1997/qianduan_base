class Promise {
    //构造方法
    constructor(executor) {
        this.promiseState = 'pending'
        this.promiseResult = null
        this.callbacks = []
        //保存实例对象this的值
        const self = this
        //resolve函数
        function resolve(data) {
            //判断状态
            if (self.promiseState !== 'pending') return
            //1.修改对象的状态(promiseState)
            self.promiseState = 'fulfilled'
            //2.设置对象结果值(promiseResult)
            self.promiseResult = data
            //调用成功的回调函数
            setTimeout(()=> {
                self.callbacks.forEach(item => {
                    item.onResolved(data)
                })
            })
        }
        function reject(data) {
            if (self.promiseState !== 'pending') return
            //1.修改对象的状态(promiseState)
            self.promiseState = 'rejected'
            //2.设置对象结果值(promiseResult)
            self.promiseResult = data
            //调用失败的回调函数
            setTimeout(() => {
                self.callbacks.forEach(item => {
                    item.onRejected(data)
                })
            })
        }

        try{
            //同步调用「执行器函数」
            executor(resolve, reject)
        }catch (e){
            //修改promise对象状态为「失败」
            reject(e)
        }
    }

    then(onResolved, onRejected) {
        const self = this
        //判断回调函数参数
        if (typeof onRejected !== 'function'){
            onRejected = reason => {
                throw reason
            }
        }
        if (typeof onResolved !== 'function'){
            onRejected = value => value
        }
        return new Promise((resolve, reject) => {
            //封装函数
            function callback(type){
                try {
                    let result = type(self.promiseResult)
                    //判断
                    if (result instanceof Promise){
                        //如果是Promise类型的对象
                        result.then(v =>{
                            resolve(v)
                        }, r => {
                            reject(r)
                        })
                    }else{
                        //结果的对象状态为「成功」
                        resolve(result)
                    }
                }catch (e){
                    reject(e)
                }
            }
            //调用回调函数
            if (this.promiseState === 'fulfilled'){
                setTimeout(() => {
                    callback(onResolved)
                })
            }
            if (this.promiseState === 'rejected'){
                setTimeout(() => {
                    callback(onRejected)
                })
            }
            if (this.promiseState === 'pending'){
                this.callbacks.push({
                    onResolved: function (){
                        callback(onResolved)
                    },
                    onRejected: function (){
                        callback(onRejected)
                    }
                })
            }
        })
    }

    catch(onRejected){
        return this.then(undefined, onRejected)
    }

    static resolve(value){
        return new Promise((resolve, reject) => {
            if (value instanceof Promise){
                value.then(v => {
                    resolve(v)
                }, r => {
                    reject(r)
                })
            }else{
                resolve(value)
            }
        })
    }

    static reject(reason){
        return new Promise((resolve, reject) => {
            reject(reason)
        })
    }

    static all(promises){
        return new Promise((resolve, reject) => {
            let count = 0
            let arr = []
            for (let i = 0; i < promises.length; i++){
                promises[i].then(v => {
                    count++
                    arr[i] = v
                    if (count === promises.length){
                        resolve(arr)
                    }
                }, r => {
                    reject(r)
                })
            }
        })
    }

    static race(promises){
        return new Promise((resolve, reject) => {
            for (let i = 0; i < promises.length; i++){
                promises[i].then(v => {
                    resolve(v)
                }, r => {
                    reject(r)
                })
            }
        })
    }
}

// function Promise(executor){
//     this.promiseState = 'pending'
//     this.promiseResult = null
//     this.callbacks = []
//     //保存实例对象this的值
//     const self = this
//     //resolve函数
//     function resolve(data) {
//         //判断状态
//         if (self.promiseState !== 'pending') return
//         //1.修改对象的状态(promiseState)
//         self.promiseState = 'fulfilled'
//         //2.设置对象结果值(promiseResult)
//         self.promiseResult = data
//         //调用成功的回调函数
//         setTimeout(()=> {
//             self.callbacks.forEach(item => {
//                 item.onResolved(data)
//             })
//         })
//     }
//     function reject(data) {
//         if (self.promiseState !== 'pending') return
//         //1.修改对象的状态(promiseState)
//         self.promiseState = 'rejected'
//         //2.设置对象结果值(promiseResult)
//         self.promiseResult = data
//         //调用失败的回调函数
//         setTimeout(() => {
//             self.callbacks.forEach(item => {
//                 item.onRejected(data)
//             })
//         })
//     }
//     try{
//         //同步调用「执行器函数」
//         executor(resolve, reject)
//     }catch (e){
//         //修改promise对象状态为「失败」
//         reject(e)
//     }
// }
//
// //添加then()
// Promise.prototype.then = function (onResolved, onRejected){
//     const self = this
//     //判断回调函数参数
//     if (typeof onRejected !== 'function'){
//         onRejected = reason => {
//             throw reason
//         }
//     }
//     if (typeof onResolved !== 'function'){
//         onRejected = value => value
//     }
//     return new Promise((resolve, reject) => {
//         //封装函数
//         function callback(type){
//             try {
//                 let result = type(self.promiseResult)
//                 //判断
//                 if (result instanceof Promise){
//                     //如果是Promise类型的对象
//                     result.then(v =>{
//                         resolve(v)
//                     }, r => {
//                         reject(r)
//                     })
//                 }else{
//                     //结果的对象状态为「成功」
//                     resolve(result)
//                 }
//             }catch (e){
//                 reject(e)
//             }
//         }
//         //调用回调函数
//         if (this.promiseState === 'fulfilled'){
//             setTimeout(() => {
//                 callback(onResolved)
//             })
//         }
//         if (this.promiseState === 'rejected'){
//             setTimeout(() => {
//                 callback(onRejected)
//             })
//         }
//         if (this.promiseState === 'pending'){
//             this.callbacks.push({
//                 onResolved: function (){
//                     callback(onResolved)
//                 },
//                 onRejected: function (){
//                     callback(onRejected)
//                 }
//             })
//         }
//     })
// }
//
// //添加catch()，异常穿透
// Promise.prototype.catch = function (onRejected){
//     return this.then(undefined, onRejected)
// }
//
// //添加resolve()
// Promise.resolve = function (value){
//     return new Promise((resolve, reject) => {
//         if (value instanceof Promise){
//             value.then(v => {
//                 resolve(v)
//             }, r => {
//                 reject(r)
//             })
//         }else{
//             resolve(value)
//         }
//     })
// }
//
// //添加reject()
// Promise.reject = function (reason){
//     return new Promise((resolve, reject) => {
//         reject(reason)
//     })
// }
//
// //添加all()
// Promise.all = function (promises){
//     return new Promise((resolve, reject) => {
//         let count = 0
//         let arr = []
//         for (let i = 0; i < promises.length; i++){
//             promises[i].then(v => {
//                 count++
//                 arr[i] = v
//                 if (count === promises.length){
//                     resolve(arr)
//                 }
//             }, r => {
//                 reject(r)
//             })
//         }
//     })
// }
//
// //添加race()
// Promise.race = function (promises){
//     return new Promise((resolve, reject) => {
//         for (let i = 0; i < promises.length; i++){
//             promises[i].then(v => {
//                 resolve(v)
//             }, r => {
//                 reject(r)
//             })
//         }
//     })
// }