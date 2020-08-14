
//*takes array of objects[{ele:element or array of elements, ev:event or array of events, fun:function, action:"add" or "remove", opts:optional, {} or options object}]
//*if element or event is an array, function runs through elements first, then events.
export const groupListeners = (arr) => {
    for (let i in arr) { 
        let ops = arr[i].opts || {};
        if (Array.isArray(arr[i].ele)) {
            arr[i].ele.forEach(el => {
                groupListeners([{ele:el, ev:arr[i].ev, fun:arr[i].fun, action:arr[i].action, opts:ops}]);
            });
        } else if (Array.isArray(arr[i].ev)) {
            arr[i].ev.forEach(e => {
                groupListeners([{ele:arr[i].ele, ev:e, fun:arr[i].fun, action:arr[i].action, opts:ops}]);
            })
        } else { 
            arr[i].ele[`${arr[i].action}EventListener`](arr[i].ev, arr[i].fun, ops);
        }
    }
}