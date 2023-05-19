let wasm;
export function __wbg_set_wasm(val) {
    wasm = val;
}


const heap = new Array(128).fill(undefined);

heap.push(undefined, null, true, false);

function getObject(idx) { return heap[idx]; }

let heap_next = heap.length;

function dropObject(idx) {
    if (idx < 132) return;
    heap[idx] = heap_next;
    heap_next = idx;
}

function takeObject(idx) {
    const ret = getObject(idx);
    dropObject(idx);
    return ret;
}

function addHeapObject(obj) {
    if (heap_next === heap.length) heap.push(heap.length + 1);
    const idx = heap_next;
    heap_next = heap[idx];

    heap[idx] = obj;
    return idx;
}

const lTextDecoder = typeof TextDecoder === 'undefined' ? (0, module.require)('util').TextDecoder : TextDecoder;

let cachedTextDecoder = new lTextDecoder('utf-8', { ignoreBOM: true, fatal: true });

cachedTextDecoder.decode();

let cachedUint8Memory0 = null;

function getUint8Memory0() {
    if (cachedUint8Memory0 === null || cachedUint8Memory0.byteLength === 0) {
        cachedUint8Memory0 = new Uint8Array(wasm.memory.buffer);
    }
    return cachedUint8Memory0;
}

function getStringFromWasm0(ptr, len) {
    ptr = ptr >>> 0;
    return cachedTextDecoder.decode(getUint8Memory0().subarray(ptr, ptr + len));
}

let WASM_VECTOR_LEN = 0;

const lTextEncoder = typeof TextEncoder === 'undefined' ? (0, module.require)('util').TextEncoder : TextEncoder;

let cachedTextEncoder = new lTextEncoder('utf-8');

const encodeString = (typeof cachedTextEncoder.encodeInto === 'function'
    ? function (arg, view) {
    return cachedTextEncoder.encodeInto(arg, view);
}
    : function (arg, view) {
    const buf = cachedTextEncoder.encode(arg);
    view.set(buf);
    return {
        read: arg.length,
        written: buf.length
    };
});

function passStringToWasm0(arg, malloc, realloc) {

    if (realloc === undefined) {
        const buf = cachedTextEncoder.encode(arg);
        const ptr = malloc(buf.length) >>> 0;
        getUint8Memory0().subarray(ptr, ptr + buf.length).set(buf);
        WASM_VECTOR_LEN = buf.length;
        return ptr;
    }

    let len = arg.length;
    let ptr = malloc(len) >>> 0;

    const mem = getUint8Memory0();

    let offset = 0;

    for (; offset < len; offset++) {
        const code = arg.charCodeAt(offset);
        if (code > 0x7F) break;
        mem[ptr + offset] = code;
    }

    if (offset !== len) {
        if (offset !== 0) {
            arg = arg.slice(offset);
        }
        ptr = realloc(ptr, len, len = offset + arg.length * 3) >>> 0;
        const view = getUint8Memory0().subarray(ptr + offset, ptr + len);
        const ret = encodeString(arg, view);

        offset += ret.written;
    }

    WASM_VECTOR_LEN = offset;
    return ptr;
}

function isLikeNone(x) {
    return x === undefined || x === null;
}

let cachedInt32Memory0 = null;

function getInt32Memory0() {
    if (cachedInt32Memory0 === null || cachedInt32Memory0.byteLength === 0) {
        cachedInt32Memory0 = new Int32Array(wasm.memory.buffer);
    }
    return cachedInt32Memory0;
}

let cachedFloat64Memory0 = null;

function getFloat64Memory0() {
    if (cachedFloat64Memory0 === null || cachedFloat64Memory0.byteLength === 0) {
        cachedFloat64Memory0 = new Float64Array(wasm.memory.buffer);
    }
    return cachedFloat64Memory0;
}

function debugString(val) {
    // primitive types
    const type = typeof val;
    if (type == 'number' || type == 'boolean' || val == null) {
        return  `${val}`;
    }
    if (type == 'string') {
        return `"${val}"`;
    }
    if (type == 'symbol') {
        const description = val.description;
        if (description == null) {
            return 'Symbol';
        } else {
            return `Symbol(${description})`;
        }
    }
    if (type == 'function') {
        const name = val.name;
        if (typeof name == 'string' && name.length > 0) {
            return `Function(${name})`;
        } else {
            return 'Function';
        }
    }
    // objects
    if (Array.isArray(val)) {
        const length = val.length;
        let debug = '[';
        if (length > 0) {
            debug += debugString(val[0]);
        }
        for(let i = 1; i < length; i++) {
            debug += ', ' + debugString(val[i]);
        }
        debug += ']';
        return debug;
    }
    // Test for built-in
    const builtInMatches = /\[object ([^\]]+)\]/.exec(toString.call(val));
    let className;
    if (builtInMatches.length > 1) {
        className = builtInMatches[1];
    } else {
        // Failed to match the standard '[object ClassName]'
        return toString.call(val);
    }
    if (className == 'Object') {
        // we're a user defined class or Object
        // JSON.stringify avoids problems with cycles, and is generally much
        // easier than looping through ownProperties of `val`.
        try {
            return 'Object(' + JSON.stringify(val) + ')';
        } catch (_) {
            return 'Object';
        }
    }
    // errors
    if (val instanceof Error) {
        return `${val.name}: ${val.message}\n${val.stack}`;
    }
    // TODO we could test for more things here, like `Set`s and `Map`s.
    return className;
}

function makeMutClosure(arg0, arg1, dtor, f) {
    const state = { a: arg0, b: arg1, cnt: 1, dtor };
    const real = (...args) => {
        // First up with a closure we increment the internal reference
        // count. This ensures that the Rust closure environment won't
        // be deallocated while we're invoking it.
        state.cnt++;
        const a = state.a;
        state.a = 0;
        try {
            return f(a, state.b, ...args);
        } finally {
            if (--state.cnt === 0) {
                wasm.__wbindgen_export_2.get(state.dtor)(a, state.b);

            } else {
                state.a = a;
            }
        }
    };
    real.original = state;

    return real;
}
function __wbg_adapter_32(arg0, arg1, arg2) {
    wasm._dyn_core__ops__function__FnMut__A____Output___R_as_wasm_bindgen__closure__WasmClosure___describe__invoke__h2edba0c6a4f0126e(arg0, arg1, addHeapObject(arg2));
}

function __wbg_adapter_45(arg0, arg1) {
    wasm._dyn_core__ops__function__FnMut_____Output___R_as_wasm_bindgen__closure__WasmClosure___describe__invoke__h6d81bc8e80800eb1(arg0, arg1);
}

function __wbg_adapter_52(arg0, arg1, arg2) {
    wasm._dyn_core__ops__function__FnMut__A____Output___R_as_wasm_bindgen__closure__WasmClosure___describe__invoke__hbab46ff1e84c5ae3(arg0, arg1, addHeapObject(arg2));
}

function __wbg_adapter_55(arg0, arg1, arg2) {
    wasm._dyn_core__ops__function__FnMut__A____Output___R_as_wasm_bindgen__closure__WasmClosure___describe__invoke__h2d635966d9f99bcd(arg0, arg1, addHeapObject(arg2));
}

function handleError(f, args) {
    try {
        return f.apply(this, args);
    } catch (e) {
        wasm.__wbindgen_exn_store(addHeapObject(e));
    }
}

let cachedFloat32Memory0 = null;

function getFloat32Memory0() {
    if (cachedFloat32Memory0 === null || cachedFloat32Memory0.byteLength === 0) {
        cachedFloat32Memory0 = new Float32Array(wasm.memory.buffer);
    }
    return cachedFloat32Memory0;
}

function getArrayF32FromWasm0(ptr, len) {
    ptr = ptr >>> 0;
    return getFloat32Memory0().subarray(ptr / 4, ptr / 4 + len);
}

function getArrayI32FromWasm0(ptr, len) {
    ptr = ptr >>> 0;
    return getInt32Memory0().subarray(ptr / 4, ptr / 4 + len);
}

let cachedUint32Memory0 = null;

function getUint32Memory0() {
    if (cachedUint32Memory0 === null || cachedUint32Memory0.byteLength === 0) {
        cachedUint32Memory0 = new Uint32Array(wasm.memory.buffer);
    }
    return cachedUint32Memory0;
}

function getArrayU32FromWasm0(ptr, len) {
    ptr = ptr >>> 0;
    return getUint32Memory0().subarray(ptr / 4, ptr / 4 + len);
}

export function __wbg_instanceof_Response_b1d8fb5649a38770(arg0) {
    let result;
    try {
        result = getObject(arg0) instanceof Response;
    } catch {
        result = false;
    }
    const ret = result;
    return ret;
};

export function __wbindgen_object_drop_ref(arg0) {
    takeObject(arg0);
};

export function __wbindgen_cb_drop(arg0) {
    const obj = takeObject(arg0).original;
    if (obj.cnt-- == 1) {
        obj.a = 0;
        return true;
    }
    const ret = false;
    return ret;
};

export function __wbindgen_object_clone_ref(arg0) {
    const ret = getObject(arg0);
    return addHeapObject(ret);
};

export function __wbg_instanceof_Window_f2bf9e8e91f1be0d(arg0) {
    let result;
    try {
        result = getObject(arg0) instanceof Window;
    } catch {
        result = false;
    }
    const ret = result;
    return ret;
};

export function __wbg_fetch_7bff72d5e7853bd9(arg0, arg1, arg2) {
    const ret = getObject(arg0).fetch(getStringFromWasm0(arg1, arg2));
    return addHeapObject(ret);
};

export function __wbg_arrayBuffer_8b744cc30bbf8d4d() { return handleError(function (arg0) {
    const ret = getObject(arg0).arrayBuffer();
    return addHeapObject(ret);
}, arguments) };

export function __wbg_new_bc5d9aad3f9ac80e(arg0) {
    const ret = new Uint8Array(getObject(arg0));
    return addHeapObject(ret);
};

export function __wbg_mark_40e050a77cc39fea(arg0, arg1) {
    performance.mark(getStringFromWasm0(arg0, arg1));
};

export function __wbg_log_c9486ca5d8e2cbe8(arg0, arg1) {
    let deferred0_0;
    let deferred0_1;
    try {
        deferred0_0 = arg0;
        deferred0_1 = arg1;
        console.log(getStringFromWasm0(arg0, arg1));
    } finally {
        wasm.__wbindgen_free(deferred0_0, deferred0_1);
    }
};

export function __wbg_log_aba5996d9bde071f(arg0, arg1, arg2, arg3, arg4, arg5, arg6, arg7) {
    let deferred0_0;
    let deferred0_1;
    try {
        deferred0_0 = arg0;
        deferred0_1 = arg1;
        console.log(getStringFromWasm0(arg0, arg1), getStringFromWasm0(arg2, arg3), getStringFromWasm0(arg4, arg5), getStringFromWasm0(arg6, arg7));
    } finally {
        wasm.__wbindgen_free(deferred0_0, deferred0_1);
    }
};

export function __wbg_instanceof_HtmlCanvasElement_6e58598b4e8b1586(arg0) {
    let result;
    try {
        result = getObject(arg0) instanceof HTMLCanvasElement;
    } catch {
        result = false;
    }
    const ret = result;
    return ret;
};

export function __wbg_width_3a395887a577233b(arg0) {
    const ret = getObject(arg0).width;
    return ret;
};

export function __wbg_height_b7046017c4148386(arg0) {
    const ret = getObject(arg0).height;
    return ret;
};

export function __wbg_style_490ba346de45c9a1(arg0) {
    const ret = getObject(arg0).style;
    return addHeapObject(ret);
};

export function __wbg_setProperty_66e3a889ea358430() { return handleError(function (arg0, arg1, arg2, arg3, arg4) {
    getObject(arg0).setProperty(getStringFromWasm0(arg1, arg2), getStringFromWasm0(arg3, arg4));
}, arguments) };

export function __wbg_setAttribute_e8e8474a029723cb() { return handleError(function (arg0, arg1, arg2, arg3, arg4) {
    getObject(arg0).setAttribute(getStringFromWasm0(arg1, arg2), getStringFromWasm0(arg3, arg4));
}, arguments) };

export function __wbg_addEventListener_7759570e045ab41e() { return handleError(function (arg0, arg1, arg2, arg3) {
    getObject(arg0).addEventListener(getStringFromWasm0(arg1, arg2), getObject(arg3));
}, arguments) };

export function __wbg_document_a11e2f345af07033(arg0) {
    const ret = getObject(arg0).document;
    return isLikeNone(ret) ? 0 : addHeapObject(ret);
};

export function __wbg_querySelector_d96bcd0615189348() { return handleError(function (arg0, arg1, arg2) {
    const ret = getObject(arg0).querySelector(getStringFromWasm0(arg1, arg2));
    return isLikeNone(ret) ? 0 : addHeapObject(ret);
}, arguments) };

export function __wbg_parentElement_a37a694bf4be8540(arg0) {
    const ret = getObject(arg0).parentElement;
    return isLikeNone(ret) ? 0 : addHeapObject(ret);
};

export function __wbg_getBoundingClientRect_b8fe0d836382ad77(arg0) {
    const ret = getObject(arg0).getBoundingClientRect();
    return addHeapObject(ret);
};

export function __wbg_width_c84922bad2825cbb(arg0) {
    const ret = getObject(arg0).width;
    return ret;
};

export function __wbg_height_fdcd567289eeaf76(arg0) {
    const ret = getObject(arg0).height;
    return ret;
};

export function __wbg_requestAnimationFrame_81e888f67b20c79f() { return handleError(function (arg0, arg1) {
    const ret = getObject(arg0).requestAnimationFrame(getObject(arg1));
    return ret;
}, arguments) };

export function __wbg_setTimeout_250d9729242b4d13() { return handleError(function (arg0, arg1, arg2) {
    const ret = getObject(arg0).setTimeout(getObject(arg1), arg2);
    return ret;
}, arguments) };

export function __wbg_body_483afe07b0958d3b(arg0) {
    const ret = getObject(arg0).body;
    return isLikeNone(ret) ? 0 : addHeapObject(ret);
};

export function __wbg_appendChild_173b88a25c048f2b() { return handleError(function (arg0, arg1) {
    const ret = getObject(arg0).appendChild(getObject(arg1));
    return addHeapObject(ret);
}, arguments) };

export function __wbg_requestPointerLock_d6e7c2127f6658e5(arg0) {
    getObject(arg0).requestPointerLock();
};

export function __wbindgen_string_new(arg0, arg1) {
    const ret = getStringFromWasm0(arg0, arg1);
    return addHeapObject(ret);
};

export function __wbg_removeEventListener_32d543a6fdf88ebf() { return handleError(function (arg0, arg1, arg2, arg3, arg4) {
    getObject(arg0).removeEventListener(getStringFromWasm0(arg1, arg2), getObject(arg3), getObject(arg4));
}, arguments) };

export function __wbg_error_1b3d7220a777aa60(arg0, arg1) {
    console.error(getObject(arg0), getObject(arg1));
};

export function __wbg_stopPropagation_11273514fa613c05(arg0) {
    getObject(arg0).stopPropagation();
};

export function __wbg_cancelBubble_38e6e6bc61c2b264(arg0) {
    const ret = getObject(arg0).cancelBubble;
    return ret;
};

export function __wbg_matches_564752e14ad66e2a(arg0) {
    const ret = getObject(arg0).matches;
    return ret;
};

export function __wbg_addEventListener_808d915acd4d2282() { return handleError(function (arg0, arg1, arg2, arg3, arg4) {
    getObject(arg0).addEventListener(getStringFromWasm0(arg1, arg2), getObject(arg3), getObject(arg4));
}, arguments) };

export function __wbg_new_7befa02319b36069() {
    const ret = new Object();
    return addHeapObject(ret);
};

export function __wbg_set_bc33b7c3be9319b5() { return handleError(function (arg0, arg1, arg2) {
    const ret = Reflect.set(getObject(arg0), getObject(arg1), getObject(arg2));
    return ret;
}, arguments) };

export function __wbg_target_303861d1c3271001(arg0) {
    const ret = getObject(arg0).target;
    return isLikeNone(ret) ? 0 : addHeapObject(ret);
};

export function __wbg_is_92a0f96fd97f04e4(arg0, arg1) {
    const ret = Object.is(getObject(arg0), getObject(arg1));
    return ret;
};

export function __wbg_clientX_3f85264cf22095e5(arg0) {
    const ret = getObject(arg0).clientX;
    return ret;
};

export function __wbg_x_f6d724bc73785ea9(arg0) {
    const ret = getObject(arg0).x;
    return ret;
};

export function __wbg_clientY_89c6d33983785b4c(arg0) {
    const ret = getObject(arg0).clientY;
    return ret;
};

export function __wbg_y_0f3f7e5f89d8289d(arg0) {
    const ret = getObject(arg0).y;
    return ret;
};

export function __wbg_offsetX_3e4797e74d7cd119(arg0) {
    const ret = getObject(arg0).offsetX;
    return ret;
};

export function __wbg_offsetY_d0d5c8c9d982beb2(arg0) {
    const ret = getObject(arg0).offsetY;
    return ret;
};

export function __wbg_movementX_33f3d3477f4f171b(arg0) {
    const ret = getObject(arg0).movementX;
    return ret;
};

export function __wbg_movementY_43f34bf2c669367a(arg0) {
    const ret = getObject(arg0).movementY;
    return ret;
};

export function __wbg_shiftKey_05c776bad5d51fc0(arg0) {
    const ret = getObject(arg0).shiftKey;
    return ret;
};

export function __wbg_ctrlKey_1d1f76bad2b8e2a6(arg0) {
    const ret = getObject(arg0).ctrlKey;
    return ret;
};

export function __wbg_altKey_260b114f54f8d2d7(arg0) {
    const ret = getObject(arg0).altKey;
    return ret;
};

export function __wbg_metaKey_52d6db1bcccab5ac(arg0) {
    const ret = getObject(arg0).metaKey;
    return ret;
};

export function __wbg_requestFullscreen_8dff3beb4e210efb() { return handleError(function (arg0) {
    getObject(arg0).requestFullscreen();
}, arguments) };

export function __wbg_button_2efa430f9add0993(arg0) {
    const ret = getObject(arg0).button;
    return ret;
};

export function __wbg_buttons_489c8b943073f8da(arg0) {
    const ret = getObject(arg0).buttons;
    return ret;
};

export function __wbg_pointerType_83e8f5460c19d633(arg0, arg1) {
    const ret = getObject(arg1).pointerType;
    const ptr1 = passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len1 = WASM_VECTOR_LEN;
    getInt32Memory0()[arg0 / 4 + 1] = len1;
    getInt32Memory0()[arg0 / 4 + 0] = ptr1;
};

export function __wbg_pointerId_110fbf1bac892eed(arg0) {
    const ret = getObject(arg0).pointerId;
    return ret;
};

export function __wbg_setPointerCapture_cebf0079be4a17d9() { return handleError(function (arg0, arg1) {
    getObject(arg0).setPointerCapture(arg1);
}, arguments) };

export function __wbg_pressure_e9c4824793381f6a(arg0) {
    const ret = getObject(arg0).pressure;
    return ret;
};

export function __wbg_preventDefault_23c6bf1d0b02c67a(arg0) {
    getObject(arg0).preventDefault();
};

export function __wbg_keyCode_15ab4cf0a03d1c06(arg0) {
    const ret = getObject(arg0).keyCode;
    return ret;
};

export function __wbg_charCode_c07e50875d746a56(arg0) {
    const ret = getObject(arg0).charCode;
    return ret;
};

export function __wbg_shiftKey_85b0f1542b5da6bd(arg0) {
    const ret = getObject(arg0).shiftKey;
    return ret;
};

export function __wbg_ctrlKey_4530e4ce8b727d5b(arg0) {
    const ret = getObject(arg0).ctrlKey;
    return ret;
};

export function __wbg_altKey_d5019155384cdb12(arg0) {
    const ret = getObject(arg0).altKey;
    return ret;
};

export function __wbg_metaKey_d33b1a7b4af847f4(arg0) {
    const ret = getObject(arg0).metaKey;
    return ret;
};

export function __wbg_key_e340e265ee020ac5(arg0, arg1) {
    const ret = getObject(arg1).key;
    const ptr1 = passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len1 = WASM_VECTOR_LEN;
    getInt32Memory0()[arg0 / 4 + 1] = len1;
    getInt32Memory0()[arg0 / 4 + 0] = ptr1;
};

export function __wbg_getModifierState_2a5e4174277e3153(arg0, arg1, arg2) {
    const ret = getObject(arg0).getModifierState(getStringFromWasm0(arg1, arg2));
    return ret;
};

export function __wbg_new_abda76e883ba8a5f() {
    const ret = new Error();
    return addHeapObject(ret);
};

export function __wbg_stack_658279fe44541cf6(arg0, arg1) {
    const ret = getObject(arg1).stack;
    const ptr1 = passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len1 = WASM_VECTOR_LEN;
    getInt32Memory0()[arg0 / 4 + 1] = len1;
    getInt32Memory0()[arg0 / 4 + 0] = ptr1;
};

export function __wbg_error_f851667af71bcfc6(arg0, arg1) {
    let deferred0_0;
    let deferred0_1;
    try {
        deferred0_0 = arg0;
        deferred0_1 = arg1;
        console.error(getStringFromWasm0(arg0, arg1));
    } finally {
        wasm.__wbindgen_free(deferred0_0, deferred0_1);
    }
};

export function __wbg_subarray_7649d027b2b141b3(arg0, arg1, arg2) {
    const ret = getObject(arg0).subarray(arg1 >>> 0, arg2 >>> 0);
    return addHeapObject(ret);
};

export function __wbg_getRandomValues_3774744e221a22ad() { return handleError(function (arg0, arg1) {
    getObject(arg0).getRandomValues(getObject(arg1));
}, arguments) };

export function __wbindgen_memory() {
    const ret = wasm.memory;
    return addHeapObject(ret);
};

export function __wbg_buffer_fcbfb6d88b2732e9(arg0) {
    const ret = getObject(arg0).buffer;
    return addHeapObject(ret);
};

export function __wbg_set_4b3aa8445ac1e91c(arg0, arg1, arg2) {
    getObject(arg0).set(getObject(arg1), arg2 >>> 0);
};

export function __wbg_newwithbyteoffsetandlength_92c251989c485785(arg0, arg1, arg2) {
    const ret = new Uint8Array(getObject(arg0), arg1 >>> 0, arg2 >>> 0);
    return addHeapObject(ret);
};

export function __wbg_randomFillSync_e950366c42764a07() { return handleError(function (arg0, arg1) {
    getObject(arg0).randomFillSync(takeObject(arg1));
}, arguments) };

export function __wbg_crypto_70a96de3b6b73dac(arg0) {
    const ret = getObject(arg0).crypto;
    return addHeapObject(ret);
};

export function __wbindgen_is_object(arg0) {
    const val = getObject(arg0);
    const ret = typeof(val) === 'object' && val !== null;
    return ret;
};

export function __wbg_process_dd1577445152112e(arg0) {
    const ret = getObject(arg0).process;
    return addHeapObject(ret);
};

export function __wbg_versions_58036bec3add9e6f(arg0) {
    const ret = getObject(arg0).versions;
    return addHeapObject(ret);
};

export function __wbg_node_6a9d28205ed5b0d8(arg0) {
    const ret = getObject(arg0).node;
    return addHeapObject(ret);
};

export function __wbindgen_is_string(arg0) {
    const ret = typeof(getObject(arg0)) === 'string';
    return ret;
};

export function __wbg_msCrypto_adbc770ec9eca9c7(arg0) {
    const ret = getObject(arg0).msCrypto;
    return addHeapObject(ret);
};

export function __wbg_require_f05d779769764e82() { return handleError(function () {
    const ret = module.require;
    return addHeapObject(ret);
}, arguments) };

export function __wbindgen_is_function(arg0) {
    const ret = typeof(getObject(arg0)) === 'function';
    return ret;
};

export function __wbg_call_35782e9a1aa5e091() { return handleError(function (arg0, arg1, arg2) {
    const ret = getObject(arg0).call(getObject(arg1), getObject(arg2));
    return addHeapObject(ret);
}, arguments) };

export function __wbg_newwithlength_89eca18f2603a999(arg0) {
    const ret = new Uint8Array(arg0 >>> 0);
    return addHeapObject(ret);
};

export function __wbg_getExtension_c72e1499523e8324() { return handleError(function (arg0, arg1, arg2) {
    const ret = getObject(arg0).getExtension(getStringFromWasm0(arg1, arg2));
    return isLikeNone(ret) ? 0 : addHeapObject(ret);
}, arguments) };

export function __wbg_getSupportedExtensions_48164dba2d88454a(arg0) {
    const ret = getObject(arg0).getSupportedExtensions();
    return isLikeNone(ret) ? 0 : addHeapObject(ret);
};

export function __wbg_length_070e3265c186df02(arg0) {
    const ret = getObject(arg0).length;
    return ret;
};

export function __wbg_getParameter_2a3d0a319ce30e5c() { return handleError(function (arg0, arg1) {
    const ret = getObject(arg0).getParameter(arg1 >>> 0);
    return addHeapObject(ret);
}, arguments) };

export function __wbindgen_string_get(arg0, arg1) {
    const obj = getObject(arg1);
    const ret = typeof(obj) === 'string' ? obj : undefined;
    var ptr1 = isLikeNone(ret) ? 0 : passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    var len1 = WASM_VECTOR_LEN;
    getInt32Memory0()[arg0 / 4 + 1] = len1;
    getInt32Memory0()[arg0 / 4 + 0] = ptr1;
};

export function __wbg_texSubImage2D_d767cdc461ee25f8() { return handleError(function (arg0, arg1, arg2, arg3, arg4, arg5, arg6, arg7, arg8, arg9) {
    getObject(arg0).texSubImage2D(arg1 >>> 0, arg2, arg3, arg4, arg5, arg6, arg7 >>> 0, arg8 >>> 0, getObject(arg9));
}, arguments) };

export function __wbg_texSubImage2D_761356c677175409() { return handleError(function (arg0, arg1, arg2, arg3, arg4, arg5, arg6, arg7, arg8, arg9) {
    getObject(arg0).texSubImage2D(arg1 >>> 0, arg2, arg3, arg4, arg5, arg6, arg7 >>> 0, arg8 >>> 0, getObject(arg9));
}, arguments) };

export function __wbg_texSubImage2D_d2702f7cb8543358() { return handleError(function (arg0, arg1, arg2, arg3, arg4, arg5, arg6, arg7, arg8, arg9) {
    getObject(arg0).texSubImage2D(arg1 >>> 0, arg2, arg3, arg4, arg5, arg6, arg7 >>> 0, arg8 >>> 0, getObject(arg9));
}, arguments) };

export function __wbg_texSubImage3D_65f4462456424c02() { return handleError(function (arg0, arg1, arg2, arg3, arg4, arg5, arg6, arg7, arg8, arg9, arg10, arg11) {
    getObject(arg0).texSubImage3D(arg1 >>> 0, arg2, arg3, arg4, arg5, arg6, arg7, arg8, arg9 >>> 0, arg10 >>> 0, getObject(arg11));
}, arguments) };

export function __wbg_texSubImage3D_3c7a26f2a0957a4e() { return handleError(function (arg0, arg1, arg2, arg3, arg4, arg5, arg6, arg7, arg8, arg9, arg10, arg11) {
    getObject(arg0).texSubImage3D(arg1 >>> 0, arg2, arg3, arg4, arg5, arg6, arg7, arg8, arg9 >>> 0, arg10 >>> 0, getObject(arg11));
}, arguments) };

export function __wbg_texSubImage3D_c118e7fb979c0aec() { return handleError(function (arg0, arg1, arg2, arg3, arg4, arg5, arg6, arg7, arg8, arg9, arg10, arg11) {
    getObject(arg0).texSubImage3D(arg1 >>> 0, arg2, arg3, arg4, arg5, arg6, arg7, arg8, arg9 >>> 0, arg10 >>> 0, getObject(arg11));
}, arguments) };

export function __wbg_framebufferTextureMultiviewOVR_6455c1442624e5db(arg0, arg1, arg2, arg3, arg4, arg5, arg6) {
    getObject(arg0).framebufferTextureMultiviewOVR(arg1 >>> 0, arg2 >>> 0, getObject(arg3), arg4, arg5, arg6);
};

export function __wbg_bindFramebuffer_9d5340bd2d656055(arg0, arg1, arg2) {
    getObject(arg0).bindFramebuffer(arg1 >>> 0, getObject(arg2));
};

export function __wbg_bindFramebuffer_4619be0e1995055b(arg0, arg1, arg2) {
    getObject(arg0).bindFramebuffer(arg1 >>> 0, getObject(arg2));
};

export function __wbg_createFramebuffer_c6a70d5aa82008f4(arg0) {
    const ret = getObject(arg0).createFramebuffer();
    return isLikeNone(ret) ? 0 : addHeapObject(ret);
};

export function __wbg_createFramebuffer_3241f11fdc03e168(arg0) {
    const ret = getObject(arg0).createFramebuffer();
    return isLikeNone(ret) ? 0 : addHeapObject(ret);
};

export function __wbg_createQuery_61af9c5f98b405fb(arg0) {
    const ret = getObject(arg0).createQuery();
    return isLikeNone(ret) ? 0 : addHeapObject(ret);
};

export function __wbg_createRenderbuffer_67cd8ace436818d5(arg0) {
    const ret = getObject(arg0).createRenderbuffer();
    return isLikeNone(ret) ? 0 : addHeapObject(ret);
};

export function __wbg_createRenderbuffer_28efc71569a4fa54(arg0) {
    const ret = getObject(arg0).createRenderbuffer();
    return isLikeNone(ret) ? 0 : addHeapObject(ret);
};

export function __wbg_createSampler_5dfe6de503194a63(arg0) {
    const ret = getObject(arg0).createSampler();
    return isLikeNone(ret) ? 0 : addHeapObject(ret);
};

export function __wbg_createShader_173ebd230ff03521(arg0, arg1) {
    const ret = getObject(arg0).createShader(arg1 >>> 0);
    return isLikeNone(ret) ? 0 : addHeapObject(ret);
};

export function __wbg_createShader_e31c6a5e557b0cb3(arg0, arg1) {
    const ret = getObject(arg0).createShader(arg1 >>> 0);
    return isLikeNone(ret) ? 0 : addHeapObject(ret);
};

export function __wbg_createTexture_2bfdb7fd3ec147d0(arg0) {
    const ret = getObject(arg0).createTexture();
    return isLikeNone(ret) ? 0 : addHeapObject(ret);
};

export function __wbg_createTexture_0602453d2b8f1fb1(arg0) {
    const ret = getObject(arg0).createTexture();
    return isLikeNone(ret) ? 0 : addHeapObject(ret);
};

export function __wbg_deleteShader_4d1143bd9dc59139(arg0, arg1) {
    getObject(arg0).deleteShader(getObject(arg1));
};

export function __wbg_deleteShader_c73858286febfc6c(arg0, arg1) {
    getObject(arg0).deleteShader(getObject(arg1));
};

export function __wbg_shaderSource_960bb50790e2a77a(arg0, arg1, arg2, arg3) {
    getObject(arg0).shaderSource(getObject(arg1), getStringFromWasm0(arg2, arg3));
};

export function __wbg_shaderSource_c7b77a0fc5e466be(arg0, arg1, arg2, arg3) {
    getObject(arg0).shaderSource(getObject(arg1), getStringFromWasm0(arg2, arg3));
};

export function __wbg_compileShader_f763d6c4be740123(arg0, arg1) {
    getObject(arg0).compileShader(getObject(arg1));
};

export function __wbg_compileShader_79c5133937cc20b8(arg0, arg1) {
    getObject(arg0).compileShader(getObject(arg1));
};

export function __wbg_getShaderParameter_4e42a8c6e75ab55c(arg0, arg1, arg2) {
    const ret = getObject(arg0).getShaderParameter(getObject(arg1), arg2 >>> 0);
    return addHeapObject(ret);
};

export function __wbg_getShaderParameter_68d61198240e75a8(arg0, arg1, arg2) {
    const ret = getObject(arg0).getShaderParameter(getObject(arg1), arg2 >>> 0);
    return addHeapObject(ret);
};

export function __wbindgen_boolean_get(arg0) {
    const v = getObject(arg0);
    const ret = typeof(v) === 'boolean' ? (v ? 1 : 0) : 2;
    return ret;
};

export function __wbg_getShaderInfoLog_e244928c4090df86(arg0, arg1, arg2) {
    const ret = getObject(arg1).getShaderInfoLog(getObject(arg2));
    var ptr1 = isLikeNone(ret) ? 0 : passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    var len1 = WASM_VECTOR_LEN;
    getInt32Memory0()[arg0 / 4 + 1] = len1;
    getInt32Memory0()[arg0 / 4 + 0] = ptr1;
};

export function __wbg_getShaderInfoLog_2648a4977707108a(arg0, arg1, arg2) {
    const ret = getObject(arg1).getShaderInfoLog(getObject(arg2));
    var ptr1 = isLikeNone(ret) ? 0 : passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    var len1 = WASM_VECTOR_LEN;
    getInt32Memory0()[arg0 / 4 + 1] = len1;
    getInt32Memory0()[arg0 / 4 + 0] = ptr1;
};

export function __wbg_createProgram_7aede818c7f6df6e(arg0) {
    const ret = getObject(arg0).createProgram();
    return isLikeNone(ret) ? 0 : addHeapObject(ret);
};

export function __wbg_createProgram_09e52acfdfd65c2f(arg0) {
    const ret = getObject(arg0).createProgram();
    return isLikeNone(ret) ? 0 : addHeapObject(ret);
};

export function __wbg_deleteProgram_90814f4531f7ae54(arg0, arg1) {
    getObject(arg0).deleteProgram(getObject(arg1));
};

export function __wbg_deleteProgram_eb6848c3a12f8047(arg0, arg1) {
    getObject(arg0).deleteProgram(getObject(arg1));
};

export function __wbg_attachShader_27c83348bde9d7f8(arg0, arg1, arg2) {
    getObject(arg0).attachShader(getObject(arg1), getObject(arg2));
};

export function __wbg_attachShader_856ad5064a7babed(arg0, arg1, arg2) {
    getObject(arg0).attachShader(getObject(arg1), getObject(arg2));
};

export function __wbg_linkProgram_ed95a20e6edaf5c8(arg0, arg1) {
    getObject(arg0).linkProgram(getObject(arg1));
};

export function __wbg_linkProgram_8900bcc093e56b5e(arg0, arg1) {
    getObject(arg0).linkProgram(getObject(arg1));
};

export function __wbg_getProgramParameter_05cd4988a521d16f(arg0, arg1, arg2) {
    const ret = getObject(arg0).getProgramParameter(getObject(arg1), arg2 >>> 0);
    return addHeapObject(ret);
};

export function __wbg_getProgramParameter_f37e00f0fe884347(arg0, arg1, arg2) {
    const ret = getObject(arg0).getProgramParameter(getObject(arg1), arg2 >>> 0);
    return addHeapObject(ret);
};

export function __wbg_getProgramInfoLog_3f93f6740a866519(arg0, arg1, arg2) {
    const ret = getObject(arg1).getProgramInfoLog(getObject(arg2));
    var ptr1 = isLikeNone(ret) ? 0 : passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    var len1 = WASM_VECTOR_LEN;
    getInt32Memory0()[arg0 / 4 + 1] = len1;
    getInt32Memory0()[arg0 / 4 + 0] = ptr1;
};

export function __wbg_getProgramInfoLog_d412c7162eae4d78(arg0, arg1, arg2) {
    const ret = getObject(arg1).getProgramInfoLog(getObject(arg2));
    var ptr1 = isLikeNone(ret) ? 0 : passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    var len1 = WASM_VECTOR_LEN;
    getInt32Memory0()[arg0 / 4 + 1] = len1;
    getInt32Memory0()[arg0 / 4 + 0] = ptr1;
};

export function __wbindgen_number_get(arg0, arg1) {
    const obj = getObject(arg1);
    const ret = typeof(obj) === 'number' ? obj : undefined;
    getFloat64Memory0()[arg0 / 8 + 1] = isLikeNone(ret) ? 0 : ret;
    getInt32Memory0()[arg0 / 4 + 0] = !isLikeNone(ret);
};

export function __wbg_getActiveUniform_694478fe71ce5669(arg0, arg1, arg2) {
    const ret = getObject(arg0).getActiveUniform(getObject(arg1), arg2 >>> 0);
    return isLikeNone(ret) ? 0 : addHeapObject(ret);
};

export function __wbg_size_b1737bf5042f412f(arg0) {
    const ret = getObject(arg0).size;
    return ret;
};

export function __wbg_type_7ebb4e6e82f318a5(arg0) {
    const ret = getObject(arg0).type;
    return ret;
};

export function __wbg_name_8f8c41d4175060c5(arg0, arg1) {
    const ret = getObject(arg1).name;
    const ptr1 = passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len1 = WASM_VECTOR_LEN;
    getInt32Memory0()[arg0 / 4 + 1] = len1;
    getInt32Memory0()[arg0 / 4 + 0] = ptr1;
};

export function __wbg_getActiveUniform_087a85135e75d5d0(arg0, arg1, arg2) {
    const ret = getObject(arg0).getActiveUniform(getObject(arg1), arg2 >>> 0);
    return isLikeNone(ret) ? 0 : addHeapObject(ret);
};

export function __wbg_useProgram_272f4ec4ef3ad678(arg0, arg1) {
    getObject(arg0).useProgram(getObject(arg1));
};

export function __wbg_useProgram_0101905edb621897(arg0, arg1) {
    getObject(arg0).useProgram(getObject(arg1));
};

export function __wbg_createBuffer_0628ce872a79d2cf(arg0) {
    const ret = getObject(arg0).createBuffer();
    return isLikeNone(ret) ? 0 : addHeapObject(ret);
};

export function __wbg_createBuffer_d3a92ef12a940b59(arg0) {
    const ret = getObject(arg0).createBuffer();
    return isLikeNone(ret) ? 0 : addHeapObject(ret);
};

export function __wbg_bindBuffer_1742b5eb64ebc6b5(arg0, arg1, arg2) {
    getObject(arg0).bindBuffer(arg1 >>> 0, getObject(arg2));
};

export function __wbg_bindBuffer_fa9b78a8188035be(arg0, arg1, arg2) {
    getObject(arg0).bindBuffer(arg1 >>> 0, getObject(arg2));
};

export function __wbg_bindBufferRange_b0162ee0888eaa14(arg0, arg1, arg2, arg3, arg4, arg5) {
    getObject(arg0).bindBufferRange(arg1 >>> 0, arg2 >>> 0, getObject(arg3), arg4, arg5);
};

export function __wbg_bindRenderbuffer_8e5b7e5cfcc075f7(arg0, arg1, arg2) {
    getObject(arg0).bindRenderbuffer(arg1 >>> 0, getObject(arg2));
};

export function __wbg_bindRenderbuffer_69713531ad126ab7(arg0, arg1, arg2) {
    getObject(arg0).bindRenderbuffer(arg1 >>> 0, getObject(arg2));
};

export function __wbg_blitFramebuffer_ad53ce219f0cf62b(arg0, arg1, arg2, arg3, arg4, arg5, arg6, arg7, arg8, arg9, arg10) {
    getObject(arg0).blitFramebuffer(arg1, arg2, arg3, arg4, arg5, arg6, arg7, arg8, arg9 >>> 0, arg10 >>> 0);
};

export function __wbg_createVertexArrayOES_b1ae31e81967c8cf(arg0) {
    const ret = getObject(arg0).createVertexArrayOES();
    return isLikeNone(ret) ? 0 : addHeapObject(ret);
};

export function __wbg_createVertexArray_45beaa3615966663(arg0) {
    const ret = getObject(arg0).createVertexArray();
    return isLikeNone(ret) ? 0 : addHeapObject(ret);
};

export function __wbg_deleteVertexArray_a6971e00a8f8ec8f(arg0, arg1) {
    getObject(arg0).deleteVertexArray(getObject(arg1));
};

export function __wbg_deleteVertexArrayOES_24946d47839f5f93(arg0, arg1) {
    getObject(arg0).deleteVertexArrayOES(getObject(arg1));
};

export function __wbg_bindVertexArray_e2c4ca703e8438da(arg0, arg1) {
    getObject(arg0).bindVertexArray(getObject(arg1));
};

export function __wbg_bindVertexArrayOES_23dfa6fba9f2befe(arg0, arg1) {
    getObject(arg0).bindVertexArrayOES(getObject(arg1));
};

export function __wbg_pixelStorei_27303ed20a82eadf(arg0, arg1, arg2) {
    getObject(arg0).pixelStorei(arg1 >>> 0, arg2);
};

export function __wbg_pixelStorei_d417f51c717fd87b(arg0, arg1, arg2) {
    getObject(arg0).pixelStorei(arg1 >>> 0, arg2);
};

export function __wbg_bufferData_c5d1929b85488552(arg0, arg1, arg2, arg3) {
    getObject(arg0).bufferData(arg1 >>> 0, arg2, arg3 >>> 0);
};

export function __wbg_bufferData_69020e4957842e27(arg0, arg1, arg2, arg3) {
    getObject(arg0).bufferData(arg1 >>> 0, arg2, arg3 >>> 0);
};

export function __wbg_bufferData_bbc05c15d8236e34(arg0, arg1, arg2, arg3) {
    getObject(arg0).bufferData(arg1 >>> 0, getObject(arg2), arg3 >>> 0);
};

export function __wbg_bufferData_041b82c3bb66a1e1(arg0, arg1, arg2, arg3) {
    getObject(arg0).bufferData(arg1 >>> 0, getObject(arg2), arg3 >>> 0);
};

export function __wbg_bufferSubData_37d076fb12be8f34(arg0, arg1, arg2, arg3) {
    getObject(arg0).bufferSubData(arg1 >>> 0, arg2, getObject(arg3));
};

export function __wbg_bufferSubData_c2ec02cdf05008c5(arg0, arg1, arg2, arg3) {
    getObject(arg0).bufferSubData(arg1 >>> 0, arg2, getObject(arg3));
};

export function __wbg_getBufferSubData_4f99bdba4f8bc3a1(arg0, arg1, arg2, arg3) {
    getObject(arg0).getBufferSubData(arg1 >>> 0, arg2, getObject(arg3));
};

export function __wbg_clearBufferiv_31e06bfea6b060a1(arg0, arg1, arg2, arg3, arg4) {
    getObject(arg0).clearBufferiv(arg1 >>> 0, arg2, getArrayI32FromWasm0(arg3, arg4));
};

export function __wbg_clearBufferuiv_be298734439b4ba3(arg0, arg1, arg2, arg3, arg4) {
    getObject(arg0).clearBufferuiv(arg1 >>> 0, arg2, getArrayU32FromWasm0(arg3, arg4));
};

export function __wbg_clearBufferfv_529a1d07f5ce5da3(arg0, arg1, arg2, arg3, arg4) {
    getObject(arg0).clearBufferfv(arg1 >>> 0, arg2, getArrayF32FromWasm0(arg3, arg4));
};

export function __wbg_clearBufferfi_47013f94e6aab254(arg0, arg1, arg2, arg3, arg4) {
    getObject(arg0).clearBufferfi(arg1 >>> 0, arg2, arg3, arg4);
};

export function __wbg_clientWaitSync_569b3cf8952fc34b(arg0, arg1, arg2, arg3) {
    const ret = getObject(arg0).clientWaitSync(getObject(arg1), arg2 >>> 0, arg3 >>> 0);
    return ret;
};

export function __wbg_copyBufferSubData_905910d0257d7e42(arg0, arg1, arg2, arg3, arg4, arg5) {
    getObject(arg0).copyBufferSubData(arg1 >>> 0, arg2 >>> 0, arg3, arg4, arg5);
};

export function __wbg_copyTexSubImage2D_15c9704f3f974f0c(arg0, arg1, arg2, arg3, arg4, arg5, arg6, arg7, arg8) {
    getObject(arg0).copyTexSubImage2D(arg1 >>> 0, arg2, arg3, arg4, arg5, arg6, arg7, arg8);
};

export function __wbg_copyTexSubImage2D_edf0e25b3eea7431(arg0, arg1, arg2, arg3, arg4, arg5, arg6, arg7, arg8) {
    getObject(arg0).copyTexSubImage2D(arg1 >>> 0, arg2, arg3, arg4, arg5, arg6, arg7, arg8);
};

export function __wbg_copyTexSubImage3D_cc9717a267af1995(arg0, arg1, arg2, arg3, arg4, arg5, arg6, arg7, arg8, arg9) {
    getObject(arg0).copyTexSubImage3D(arg1 >>> 0, arg2, arg3, arg4, arg5, arg6, arg7, arg8, arg9);
};

export function __wbg_deleteBuffer_cc3c83e2a10331b9(arg0, arg1) {
    getObject(arg0).deleteBuffer(getObject(arg1));
};

export function __wbg_deleteBuffer_c7b11337c6040c39(arg0, arg1) {
    getObject(arg0).deleteBuffer(getObject(arg1));
};

export function __wbg_deleteFramebuffer_2c7cf128bc349eec(arg0, arg1) {
    getObject(arg0).deleteFramebuffer(getObject(arg1));
};

export function __wbg_deleteFramebuffer_d7943cb8c4190e7a(arg0, arg1) {
    getObject(arg0).deleteFramebuffer(getObject(arg1));
};

export function __wbg_deleteQuery_0be4cdf5661e64fb(arg0, arg1) {
    getObject(arg0).deleteQuery(getObject(arg1));
};

export function __wbg_deleteRenderbuffer_70988884fd21ebd5(arg0, arg1) {
    getObject(arg0).deleteRenderbuffer(getObject(arg1));
};

export function __wbg_deleteRenderbuffer_a6a33849ea4aed73(arg0, arg1) {
    getObject(arg0).deleteRenderbuffer(getObject(arg1));
};

export function __wbg_deleteSampler_7dc99882c2337a90(arg0, arg1) {
    getObject(arg0).deleteSampler(getObject(arg1));
};

export function __wbg_deleteSync_938ae2aa547357b9(arg0, arg1) {
    getObject(arg0).deleteSync(getObject(arg1));
};

export function __wbg_deleteTexture_01f6c1a8fb2e63f2(arg0, arg1) {
    getObject(arg0).deleteTexture(getObject(arg1));
};

export function __wbg_deleteTexture_d68d1ab0526d8cf8(arg0, arg1) {
    getObject(arg0).deleteTexture(getObject(arg1));
};

export function __wbg_disable_d66d46c562d916a8(arg0, arg1) {
    getObject(arg0).disable(arg1 >>> 0);
};

export function __wbg_disable_56e95d736a56003e(arg0, arg1) {
    getObject(arg0).disable(arg1 >>> 0);
};

export function __wbg_disableVertexAttribArray_60a186ddbdedd9fb(arg0, arg1) {
    getObject(arg0).disableVertexAttribArray(arg1 >>> 0);
};

export function __wbg_disableVertexAttribArray_2cf677ce2ea177cb(arg0, arg1) {
    getObject(arg0).disableVertexAttribArray(arg1 >>> 0);
};

export function __wbg_drawArrays_08885b3aa4e8c599(arg0, arg1, arg2, arg3) {
    getObject(arg0).drawArrays(arg1 >>> 0, arg2, arg3);
};

export function __wbg_drawArrays_fd4e621011c5c584(arg0, arg1, arg2, arg3) {
    getObject(arg0).drawArrays(arg1 >>> 0, arg2, arg3);
};

export function __wbg_drawArraysInstanced_0a7af372a6ef2a77(arg0, arg1, arg2, arg3, arg4) {
    getObject(arg0).drawArraysInstanced(arg1 >>> 0, arg2, arg3, arg4);
};

export function __wbg_drawArraysInstancedANGLE_0a43d7058461f5a3(arg0, arg1, arg2, arg3, arg4) {
    getObject(arg0).drawArraysInstancedANGLE(arg1 >>> 0, arg2, arg3, arg4);
};

export function __wbg_new_18bc2084e9a3e1ff() {
    const ret = new Array();
    return addHeapObject(ret);
};

export function __wbindgen_number_new(arg0) {
    const ret = arg0;
    return addHeapObject(ret);
};

export function __wbg_push_4c1f8265c2fdf115(arg0, arg1) {
    const ret = getObject(arg0).push(getObject(arg1));
    return ret;
};

export function __wbg_of_96c3e114c6a55f7a(arg0) {
    const ret = Array.of(getObject(arg0));
    return addHeapObject(ret);
};

export function __wbg_drawBuffersWEBGL_1855fec8ab0354c0(arg0, arg1) {
    getObject(arg0).drawBuffersWEBGL(getObject(arg1));
};

export function __wbg_drawBuffers_f49105889339b34d(arg0, arg1) {
    getObject(arg0).drawBuffers(getObject(arg1));
};

export function __wbg_drawElementsInstanced_341c4d5034f6101a(arg0, arg1, arg2, arg3, arg4, arg5) {
    getObject(arg0).drawElementsInstanced(arg1 >>> 0, arg2, arg3 >>> 0, arg4, arg5);
};

export function __wbg_drawElementsInstancedANGLE_d97d93f85b5dae99(arg0, arg1, arg2, arg3, arg4, arg5) {
    getObject(arg0).drawElementsInstancedANGLE(arg1 >>> 0, arg2, arg3 >>> 0, arg4, arg5);
};

export function __wbg_enable_cec9b6cc193668e3(arg0, arg1) {
    getObject(arg0).enable(arg1 >>> 0);
};

export function __wbg_enable_045575bf10d149e5(arg0, arg1) {
    getObject(arg0).enable(arg1 >>> 0);
};

export function __wbg_enableVertexAttribArray_0f49da14b1bf5368(arg0, arg1) {
    getObject(arg0).enableVertexAttribArray(arg1 >>> 0);
};

export function __wbg_enableVertexAttribArray_e612ddd3ad45c26f(arg0, arg1) {
    getObject(arg0).enableVertexAttribArray(arg1 >>> 0);
};

export function __wbg_framebufferRenderbuffer_1f3ceb05e13b2104(arg0, arg1, arg2, arg3, arg4) {
    getObject(arg0).framebufferRenderbuffer(arg1 >>> 0, arg2 >>> 0, arg3 >>> 0, getObject(arg4));
};

export function __wbg_framebufferRenderbuffer_502c9d86d26741d1(arg0, arg1, arg2, arg3, arg4) {
    getObject(arg0).framebufferRenderbuffer(arg1 >>> 0, arg2 >>> 0, arg3 >>> 0, getObject(arg4));
};

export function __wbg_framebufferTexture2D_8235408078006004(arg0, arg1, arg2, arg3, arg4, arg5) {
    getObject(arg0).framebufferTexture2D(arg1 >>> 0, arg2 >>> 0, arg3 >>> 0, getObject(arg4), arg5);
};

export function __wbg_framebufferTexture2D_d95fec9a9cba8c5a(arg0, arg1, arg2, arg3, arg4, arg5) {
    getObject(arg0).framebufferTexture2D(arg1 >>> 0, arg2 >>> 0, arg3 >>> 0, getObject(arg4), arg5);
};

export function __wbg_framebufferTextureLayer_75cfc8b8a8a5b91c(arg0, arg1, arg2, arg3, arg4, arg5) {
    getObject(arg0).framebufferTextureLayer(arg1 >>> 0, arg2 >>> 0, getObject(arg3), arg4, arg5);
};

export function __wbg_frontFace_ee9b8ff5a2823c41(arg0, arg1) {
    getObject(arg0).frontFace(arg1 >>> 0);
};

export function __wbg_frontFace_b0d31598f8f19e65(arg0, arg1) {
    getObject(arg0).frontFace(arg1 >>> 0);
};

export function __wbg_getParameter_88377875a3b4e1ac() { return handleError(function (arg0, arg1) {
    const ret = getObject(arg0).getParameter(arg1 >>> 0);
    return addHeapObject(ret);
}, arguments) };

export function __wbg_getIndexedParameter_861809a3a20ae916() { return handleError(function (arg0, arg1, arg2) {
    const ret = getObject(arg0).getIndexedParameter(arg1 >>> 0, arg2 >>> 0);
    return addHeapObject(ret);
}, arguments) };

export function __wbg_getUniformLocation_5234f1eb12ffef3e(arg0, arg1, arg2, arg3) {
    const ret = getObject(arg0).getUniformLocation(getObject(arg1), getStringFromWasm0(arg2, arg3));
    return isLikeNone(ret) ? 0 : addHeapObject(ret);
};

export function __wbg_getUniformLocation_357d39e3b49e343f(arg0, arg1, arg2, arg3) {
    const ret = getObject(arg0).getUniformLocation(getObject(arg1), getStringFromWasm0(arg2, arg3));
    return isLikeNone(ret) ? 0 : addHeapObject(ret);
};

export function __wbg_getSyncParameter_057ee828e07ecd98(arg0, arg1, arg2) {
    const ret = getObject(arg0).getSyncParameter(getObject(arg1), arg2 >>> 0);
    return addHeapObject(ret);
};

export function __wbg_renderbufferStorage_a8312b3eab67ecf0(arg0, arg1, arg2, arg3, arg4) {
    getObject(arg0).renderbufferStorage(arg1 >>> 0, arg2 >>> 0, arg3, arg4);
};

export function __wbg_renderbufferStorage_96c73f76d2d96c22(arg0, arg1, arg2, arg3, arg4) {
    getObject(arg0).renderbufferStorage(arg1 >>> 0, arg2 >>> 0, arg3, arg4);
};

export function __wbg_renderbufferStorageMultisample_86eb364b943093fa(arg0, arg1, arg2, arg3, arg4, arg5) {
    getObject(arg0).renderbufferStorageMultisample(arg1 >>> 0, arg2, arg3 >>> 0, arg4, arg5);
};

export function __wbg_samplerParameterf_f2a5637b6ef88a80(arg0, arg1, arg2, arg3) {
    getObject(arg0).samplerParameterf(getObject(arg1), arg2 >>> 0, arg3);
};

export function __wbg_samplerParameteri_edfed698cc3e3fca(arg0, arg1, arg2, arg3) {
    getObject(arg0).samplerParameteri(getObject(arg1), arg2 >>> 0, arg3);
};

export function __wbg_texStorage2D_00339ecdf65e4414(arg0, arg1, arg2, arg3, arg4, arg5) {
    getObject(arg0).texStorage2D(arg1 >>> 0, arg2, arg3 >>> 0, arg4, arg5);
};

export function __wbg_texStorage3D_48106e548ccee4c2(arg0, arg1, arg2, arg3, arg4, arg5, arg6) {
    getObject(arg0).texStorage3D(arg1 >>> 0, arg2, arg3 >>> 0, arg4, arg5, arg6);
};

export function __wbg_uniform1i_7d2e8541868b26ce(arg0, arg1, arg2) {
    getObject(arg0).uniform1i(getObject(arg1), arg2);
};

export function __wbg_uniform1i_0d6b88caa6301092(arg0, arg1, arg2) {
    getObject(arg0).uniform1i(getObject(arg1), arg2);
};

export function __wbg_uniform2iv_e5eb47b5f4d34fd3(arg0, arg1, arg2, arg3) {
    getObject(arg0).uniform2iv(getObject(arg1), getArrayI32FromWasm0(arg2, arg3));
};

export function __wbg_uniform2iv_9b3e5de9fd7b36c8(arg0, arg1, arg2, arg3) {
    getObject(arg0).uniform2iv(getObject(arg1), getArrayI32FromWasm0(arg2, arg3));
};

export function __wbg_uniform3iv_f8e33cb143531e72(arg0, arg1, arg2, arg3) {
    getObject(arg0).uniform3iv(getObject(arg1), getArrayI32FromWasm0(arg2, arg3));
};

export function __wbg_uniform3iv_dbeee2d717aad046(arg0, arg1, arg2, arg3) {
    getObject(arg0).uniform3iv(getObject(arg1), getArrayI32FromWasm0(arg2, arg3));
};

export function __wbg_uniform4iv_782d598a7cd0a1ca(arg0, arg1, arg2, arg3) {
    getObject(arg0).uniform4iv(getObject(arg1), getArrayI32FromWasm0(arg2, arg3));
};

export function __wbg_uniform4iv_40d53a5eb436bdce(arg0, arg1, arg2, arg3) {
    getObject(arg0).uniform4iv(getObject(arg1), getArrayI32FromWasm0(arg2, arg3));
};

export function __wbg_uniform1f_5720c51623b5264a(arg0, arg1, arg2) {
    getObject(arg0).uniform1f(getObject(arg1), arg2);
};

export function __wbg_uniform1f_14bed18181a3f26e(arg0, arg1, arg2) {
    getObject(arg0).uniform1f(getObject(arg1), arg2);
};

export function __wbg_uniform4f_a57de5444bbc6279(arg0, arg1, arg2, arg3, arg4, arg5) {
    getObject(arg0).uniform4f(getObject(arg1), arg2, arg3, arg4, arg5);
};

export function __wbg_uniform4f_a06a78e922eb570a(arg0, arg1, arg2, arg3, arg4, arg5) {
    getObject(arg0).uniform4f(getObject(arg1), arg2, arg3, arg4, arg5);
};

export function __wbg_uniform2fv_12fe8ac4820280ed(arg0, arg1, arg2, arg3) {
    getObject(arg0).uniform2fv(getObject(arg1), getArrayF32FromWasm0(arg2, arg3));
};

export function __wbg_uniform2fv_cbf8363b8ee96dfd(arg0, arg1, arg2, arg3) {
    getObject(arg0).uniform2fv(getObject(arg1), getArrayF32FromWasm0(arg2, arg3));
};

export function __wbg_uniform3fv_1e829a5722c7df67(arg0, arg1, arg2, arg3) {
    getObject(arg0).uniform3fv(getObject(arg1), getArrayF32FromWasm0(arg2, arg3));
};

export function __wbg_uniform3fv_8249e6334d9a6e6a(arg0, arg1, arg2, arg3) {
    getObject(arg0).uniform3fv(getObject(arg1), getArrayF32FromWasm0(arg2, arg3));
};

export function __wbg_uniform4fv_22325c9220b96d27(arg0, arg1, arg2, arg3) {
    getObject(arg0).uniform4fv(getObject(arg1), getArrayF32FromWasm0(arg2, arg3));
};

export function __wbg_uniform4fv_9a8c4aa1306b42e6(arg0, arg1, arg2, arg3) {
    getObject(arg0).uniform4fv(getObject(arg1), getArrayF32FromWasm0(arg2, arg3));
};

export function __wbg_uniformMatrix2fv_4842ac5c5505cfa2(arg0, arg1, arg2, arg3, arg4) {
    getObject(arg0).uniformMatrix2fv(getObject(arg1), arg2 !== 0, getArrayF32FromWasm0(arg3, arg4));
};

export function __wbg_uniformMatrix2fv_09cd896cc6231067(arg0, arg1, arg2, arg3, arg4) {
    getObject(arg0).uniformMatrix2fv(getObject(arg1), arg2 !== 0, getArrayF32FromWasm0(arg3, arg4));
};

export function __wbg_uniformMatrix3fv_0bcce784a9694556(arg0, arg1, arg2, arg3, arg4) {
    getObject(arg0).uniformMatrix3fv(getObject(arg1), arg2 !== 0, getArrayF32FromWasm0(arg3, arg4));
};

export function __wbg_uniformMatrix3fv_c434b20d0bdfad5c(arg0, arg1, arg2, arg3, arg4) {
    getObject(arg0).uniformMatrix3fv(getObject(arg1), arg2 !== 0, getArrayF32FromWasm0(arg3, arg4));
};

export function __wbg_uniformMatrix4fv_1719a4aa908e0dbd(arg0, arg1, arg2, arg3, arg4) {
    getObject(arg0).uniformMatrix4fv(getObject(arg1), arg2 !== 0, getArrayF32FromWasm0(arg3, arg4));
};

export function __wbg_uniformMatrix4fv_d2d25d87034b45a4(arg0, arg1, arg2, arg3, arg4) {
    getObject(arg0).uniformMatrix4fv(getObject(arg1), arg2 !== 0, getArrayF32FromWasm0(arg3, arg4));
};

export function __wbg_cullFace_789752f04d4210de(arg0, arg1) {
    getObject(arg0).cullFace(arg1 >>> 0);
};

export function __wbg_cullFace_4299771f373e2bea(arg0, arg1) {
    getObject(arg0).cullFace(arg1 >>> 0);
};

export function __wbg_colorMask_2450aaa2241c3087(arg0, arg1, arg2, arg3, arg4) {
    getObject(arg0).colorMask(arg1 !== 0, arg2 !== 0, arg3 !== 0, arg4 !== 0);
};

export function __wbg_colorMask_f5248b605302afc8(arg0, arg1, arg2, arg3, arg4) {
    getObject(arg0).colorMask(arg1 !== 0, arg2 !== 0, arg3 !== 0, arg4 !== 0);
};

export function __wbg_depthMask_b75467edeee676da(arg0, arg1) {
    getObject(arg0).depthMask(arg1 !== 0);
};

export function __wbg_depthMask_f6c96bd33808f8b2(arg0, arg1) {
    getObject(arg0).depthMask(arg1 !== 0);
};

export function __wbg_blendColor_9f44be7ebe0377ea(arg0, arg1, arg2, arg3, arg4) {
    getObject(arg0).blendColor(arg1, arg2, arg3, arg4);
};

export function __wbg_blendColor_23eb857cb9dfb1fb(arg0, arg1, arg2, arg3, arg4) {
    getObject(arg0).blendColor(arg1, arg2, arg3, arg4);
};

export function __wbg_invalidateFramebuffer_bbeb54af65b8ffbd() { return handleError(function (arg0, arg1, arg2) {
    getObject(arg0).invalidateFramebuffer(arg1 >>> 0, getObject(arg2));
}, arguments) };

export function __wbg_polygonOffset_2d59f1f3e0db0dfd(arg0, arg1, arg2) {
    getObject(arg0).polygonOffset(arg1, arg2);
};

export function __wbg_polygonOffset_91b656e246b3c460(arg0, arg1, arg2) {
    getObject(arg0).polygonOffset(arg1, arg2);
};

export function __wbg_bindTexture_54a3690bbe49cdeb(arg0, arg1, arg2) {
    getObject(arg0).bindTexture(arg1 >>> 0, getObject(arg2));
};

export function __wbg_bindTexture_0c6c067b8de48e21(arg0, arg1, arg2) {
    getObject(arg0).bindTexture(arg1 >>> 0, getObject(arg2));
};

export function __wbg_bindSampler_7ed948668f86c8d3(arg0, arg1, arg2) {
    getObject(arg0).bindSampler(arg1 >>> 0, getObject(arg2));
};

export function __wbg_activeTexture_25e5b02da56055d9(arg0, arg1) {
    getObject(arg0).activeTexture(arg1 >>> 0);
};

export function __wbg_activeTexture_c9ff3267431e9844(arg0, arg1) {
    getObject(arg0).activeTexture(arg1 >>> 0);
};

export function __wbg_fenceSync_5c28700e55629b81(arg0, arg1, arg2) {
    const ret = getObject(arg0).fenceSync(arg1 >>> 0, arg2 >>> 0);
    return isLikeNone(ret) ? 0 : addHeapObject(ret);
};

export function __wbg_texParameteri_af5955a742697f5c(arg0, arg1, arg2, arg3) {
    getObject(arg0).texParameteri(arg1 >>> 0, arg2 >>> 0, arg3);
};

export function __wbg_texParameteri_d520b2a13b1dc357(arg0, arg1, arg2, arg3) {
    getObject(arg0).texParameteri(arg1 >>> 0, arg2 >>> 0, arg3);
};

export function __wbg_texSubImage2D_1db53138fdc3c055() { return handleError(function (arg0, arg1, arg2, arg3, arg4, arg5, arg6, arg7, arg8, arg9) {
    getObject(arg0).texSubImage2D(arg1 >>> 0, arg2, arg3, arg4, arg5, arg6, arg7 >>> 0, arg8 >>> 0, arg9);
}, arguments) };

export function __wbg_texSubImage2D_89223ea8cc4b1dbd() { return handleError(function (arg0, arg1, arg2, arg3, arg4, arg5, arg6, arg7, arg8, arg9) {
    getObject(arg0).texSubImage2D(arg1 >>> 0, arg2, arg3, arg4, arg5, arg6, arg7 >>> 0, arg8 >>> 0, getObject(arg9));
}, arguments) };

export function __wbg_texSubImage2D_4900b1678c08e07a() { return handleError(function (arg0, arg1, arg2, arg3, arg4, arg5, arg6, arg7, arg8, arg9) {
    getObject(arg0).texSubImage2D(arg1 >>> 0, arg2, arg3, arg4, arg5, arg6, arg7 >>> 0, arg8 >>> 0, getObject(arg9));
}, arguments) };

export function __wbg_compressedTexSubImage2D_7a68e2366b9be991(arg0, arg1, arg2, arg3, arg4, arg5, arg6, arg7, arg8, arg9) {
    getObject(arg0).compressedTexSubImage2D(arg1 >>> 0, arg2, arg3, arg4, arg5, arg6, arg7 >>> 0, arg8, arg9);
};

export function __wbg_newwithbyteoffsetandlength_4b9a178def6e269f(arg0, arg1, arg2) {
    const ret = new Int8Array(getObject(arg0), arg1 >>> 0, arg2 >>> 0);
    return addHeapObject(ret);
};

export function __wbg_compressedTexSubImage2D_bdc918210e5fff2e(arg0, arg1, arg2, arg3, arg4, arg5, arg6, arg7, arg8) {
    getObject(arg0).compressedTexSubImage2D(arg1 >>> 0, arg2, arg3, arg4, arg5, arg6, arg7 >>> 0, getObject(arg8));
};

export function __wbg_compressedTexSubImage2D_2325aa939a0523a5(arg0, arg1, arg2, arg3, arg4, arg5, arg6, arg7, arg8) {
    getObject(arg0).compressedTexSubImage2D(arg1 >>> 0, arg2, arg3, arg4, arg5, arg6, arg7 >>> 0, getObject(arg8));
};

export function __wbg_texSubImage3D_98ab964ee2f7669c() { return handleError(function (arg0, arg1, arg2, arg3, arg4, arg5, arg6, arg7, arg8, arg9, arg10, arg11) {
    getObject(arg0).texSubImage3D(arg1 >>> 0, arg2, arg3, arg4, arg5, arg6, arg7, arg8, arg9 >>> 0, arg10 >>> 0, arg11);
}, arguments) };

export function __wbg_texSubImage3D_abbb0e9c456a8646() { return handleError(function (arg0, arg1, arg2, arg3, arg4, arg5, arg6, arg7, arg8, arg9, arg10, arg11) {
    getObject(arg0).texSubImage3D(arg1 >>> 0, arg2, arg3, arg4, arg5, arg6, arg7, arg8, arg9 >>> 0, arg10 >>> 0, getObject(arg11));
}, arguments) };

export function __wbg_compressedTexSubImage3D_20bb0cdededa2583(arg0, arg1, arg2, arg3, arg4, arg5, arg6, arg7, arg8, arg9, arg10, arg11) {
    getObject(arg0).compressedTexSubImage3D(arg1 >>> 0, arg2, arg3, arg4, arg5, arg6, arg7, arg8, arg9 >>> 0, arg10, arg11);
};

export function __wbg_compressedTexSubImage3D_882f1b8c70425e18(arg0, arg1, arg2, arg3, arg4, arg5, arg6, arg7, arg8, arg9, arg10) {
    getObject(arg0).compressedTexSubImage3D(arg1 >>> 0, arg2, arg3, arg4, arg5, arg6, arg7, arg8, arg9 >>> 0, getObject(arg10));
};

export function __wbg_depthFunc_07f122f1ce56c723(arg0, arg1) {
    getObject(arg0).depthFunc(arg1 >>> 0);
};

export function __wbg_depthFunc_bb8bdbc4529fbc03(arg0, arg1) {
    getObject(arg0).depthFunc(arg1 >>> 0);
};

export function __wbg_depthRange_d3361769e7d4b193(arg0, arg1, arg2) {
    getObject(arg0).depthRange(arg1, arg2);
};

export function __wbg_depthRange_6902fd5437d8cb8a(arg0, arg1, arg2) {
    getObject(arg0).depthRange(arg1, arg2);
};

export function __wbg_scissor_83170faff5ae77dd(arg0, arg1, arg2, arg3, arg4) {
    getObject(arg0).scissor(arg1, arg2, arg3, arg4);
};

export function __wbg_scissor_8da52a5765745bde(arg0, arg1, arg2, arg3, arg4) {
    getObject(arg0).scissor(arg1, arg2, arg3, arg4);
};

export function __wbg_vertexAttribDivisor_31f3a570da280acc(arg0, arg1, arg2) {
    getObject(arg0).vertexAttribDivisor(arg1 >>> 0, arg2 >>> 0);
};

export function __wbg_vertexAttribDivisorANGLE_399090d217c9befd(arg0, arg1, arg2) {
    getObject(arg0).vertexAttribDivisorANGLE(arg1 >>> 0, arg2 >>> 0);
};

export function __wbg_vertexAttribPointer_e7c525af10d339fd(arg0, arg1, arg2, arg3, arg4, arg5, arg6) {
    getObject(arg0).vertexAttribPointer(arg1 >>> 0, arg2, arg3 >>> 0, arg4 !== 0, arg5, arg6);
};

export function __wbg_vertexAttribPointer_d924595d7382f271(arg0, arg1, arg2, arg3, arg4, arg5, arg6) {
    getObject(arg0).vertexAttribPointer(arg1 >>> 0, arg2, arg3 >>> 0, arg4 !== 0, arg5, arg6);
};

export function __wbg_vertexAttribIPointer_f24f2bdd6b4fcda8(arg0, arg1, arg2, arg3, arg4, arg5) {
    getObject(arg0).vertexAttribIPointer(arg1 >>> 0, arg2, arg3 >>> 0, arg4, arg5);
};

export function __wbg_viewport_b9926fef03a595fd(arg0, arg1, arg2, arg3, arg4) {
    getObject(arg0).viewport(arg1, arg2, arg3, arg4);
};

export function __wbg_viewport_26f8c317d495e905(arg0, arg1, arg2, arg3, arg4) {
    getObject(arg0).viewport(arg1, arg2, arg3, arg4);
};

export function __wbg_blendFunc_e2b8b433078bd81e(arg0, arg1, arg2) {
    getObject(arg0).blendFunc(arg1 >>> 0, arg2 >>> 0);
};

export function __wbg_blendFunc_f20008775c446032(arg0, arg1, arg2) {
    getObject(arg0).blendFunc(arg1 >>> 0, arg2 >>> 0);
};

export function __wbg_blendFuncSeparate_f9c88ee1b4fea80b(arg0, arg1, arg2, arg3, arg4) {
    getObject(arg0).blendFuncSeparate(arg1 >>> 0, arg2 >>> 0, arg3 >>> 0, arg4 >>> 0);
};

export function __wbg_blendFuncSeparate_a52bfda514294104(arg0, arg1, arg2, arg3, arg4) {
    getObject(arg0).blendFuncSeparate(arg1 >>> 0, arg2 >>> 0, arg3 >>> 0, arg4 >>> 0);
};

export function __wbg_blendEquation_7b9e525a6ac90975(arg0, arg1) {
    getObject(arg0).blendEquation(arg1 >>> 0);
};

export function __wbg_blendEquation_639ede85743b6e01(arg0, arg1) {
    getObject(arg0).blendEquation(arg1 >>> 0);
};

export function __wbg_blendEquationSeparate_8c2236c265205c64(arg0, arg1, arg2) {
    getObject(arg0).blendEquationSeparate(arg1 >>> 0, arg2 >>> 0);
};

export function __wbg_blendEquationSeparate_ec228d5e7f486801(arg0, arg1, arg2) {
    getObject(arg0).blendEquationSeparate(arg1 >>> 0, arg2 >>> 0);
};

export function __wbg_stencilFuncSeparate_c12c93d86f7390db(arg0, arg1, arg2, arg3, arg4) {
    getObject(arg0).stencilFuncSeparate(arg1 >>> 0, arg2 >>> 0, arg3, arg4 >>> 0);
};

export function __wbg_stencilFuncSeparate_b93bf91217ae27ba(arg0, arg1, arg2, arg3, arg4) {
    getObject(arg0).stencilFuncSeparate(arg1 >>> 0, arg2 >>> 0, arg3, arg4 >>> 0);
};

export function __wbg_stencilMask_b3d4e19d37bba571(arg0, arg1) {
    getObject(arg0).stencilMask(arg1 >>> 0);
};

export function __wbg_stencilMask_2a7511a440597e72(arg0, arg1) {
    getObject(arg0).stencilMask(arg1 >>> 0);
};

export function __wbg_stencilMaskSeparate_e86184859535ac0b(arg0, arg1, arg2) {
    getObject(arg0).stencilMaskSeparate(arg1 >>> 0, arg2 >>> 0);
};

export function __wbg_stencilMaskSeparate_f33c3c45cbb0060b(arg0, arg1, arg2) {
    getObject(arg0).stencilMaskSeparate(arg1 >>> 0, arg2 >>> 0);
};

export function __wbg_stencilOpSeparate_4b6b4bd3302b846d(arg0, arg1, arg2, arg3, arg4) {
    getObject(arg0).stencilOpSeparate(arg1 >>> 0, arg2 >>> 0, arg3 >>> 0, arg4 >>> 0);
};

export function __wbg_stencilOpSeparate_a84029eb5323b80e(arg0, arg1, arg2, arg3, arg4) {
    getObject(arg0).stencilOpSeparate(arg1 >>> 0, arg2 >>> 0, arg3 >>> 0, arg4 >>> 0);
};

export function __wbg_getUniformBlockIndex_499fd107f0dd59d7(arg0, arg1, arg2, arg3) {
    const ret = getObject(arg0).getUniformBlockIndex(getObject(arg1), getStringFromWasm0(arg2, arg3));
    return ret;
};

export function __wbg_uniformBlockBinding_a638a1e7a818c0ff(arg0, arg1, arg2, arg3) {
    getObject(arg0).uniformBlockBinding(getObject(arg1), arg2 >>> 0, arg3 >>> 0);
};

export function __wbg_readBuffer_fd2f0ba337afa906(arg0, arg1) {
    getObject(arg0).readBuffer(arg1 >>> 0);
};

export function __wbg_readPixels_2f24b0adca8b4c52() { return handleError(function (arg0, arg1, arg2, arg3, arg4, arg5, arg6, arg7) {
    getObject(arg0).readPixels(arg1, arg2, arg3, arg4, arg5 >>> 0, arg6 >>> 0, getObject(arg7));
}, arguments) };

export function __wbg_readPixels_11843c2168c3ebb2() { return handleError(function (arg0, arg1, arg2, arg3, arg4, arg5, arg6, arg7) {
    getObject(arg0).readPixels(arg1, arg2, arg3, arg4, arg5 >>> 0, arg6 >>> 0, getObject(arg7));
}, arguments) };

export function __wbg_readPixels_63a18271e3a4ba30() { return handleError(function (arg0, arg1, arg2, arg3, arg4, arg5, arg6, arg7) {
    getObject(arg0).readPixels(arg1, arg2, arg3, arg4, arg5 >>> 0, arg6 >>> 0, arg7);
}, arguments) };

export function __wbg_beginQuery_6fed6d9bbcff334c(arg0, arg1, arg2) {
    getObject(arg0).beginQuery(arg1 >>> 0, getObject(arg2));
};

export function __wbg_endQuery_6cdd3659886928a1(arg0, arg1) {
    getObject(arg0).endQuery(arg1 >>> 0);
};

export function __wbg_getQueryParameter_28bd93df3850adf9(arg0, arg1, arg2) {
    const ret = getObject(arg0).getQueryParameter(getObject(arg1), arg2 >>> 0);
    return addHeapObject(ret);
};

export function __wbg_newwithbyteoffsetandlength_208c7d466d312372(arg0, arg1, arg2) {
    const ret = new Int16Array(getObject(arg0), arg1 >>> 0, arg2 >>> 0);
    return addHeapObject(ret);
};

export function __wbg_newwithbyteoffsetandlength_1499d1afb70451e0(arg0, arg1, arg2) {
    const ret = new Uint16Array(getObject(arg0), arg1 >>> 0, arg2 >>> 0);
    return addHeapObject(ret);
};

export function __wbg_newwithbyteoffsetandlength_57e32268d8647004(arg0, arg1, arg2) {
    const ret = new Int32Array(getObject(arg0), arg1 >>> 0, arg2 >>> 0);
    return addHeapObject(ret);
};

export function __wbg_newwithbyteoffsetandlength_e5274b3cd02a59d1(arg0, arg1, arg2) {
    const ret = new Uint32Array(getObject(arg0), arg1 >>> 0, arg2 >>> 0);
    return addHeapObject(ret);
};

export function __wbg_newwithbyteoffsetandlength_f1c6abafdfbe8b50(arg0, arg1, arg2) {
    const ret = new Float32Array(getObject(arg0), arg1 >>> 0, arg2 >>> 0);
    return addHeapObject(ret);
};

export function __wbg_get_e52aaca45f37b337(arg0, arg1) {
    const ret = getObject(arg0)[arg1 >>> 0];
    return addHeapObject(ret);
};

export function __wbg_get_363c3b466fe4896b() { return handleError(function (arg0, arg1) {
    const ret = Reflect.get(getObject(arg0), getObject(arg1));
    return addHeapObject(ret);
}, arguments) };

export function __wbg_now_9c3c00f027cd0272(arg0) {
    const ret = getObject(arg0).now();
    return ret;
};

export function __wbg_self_b9aad7f1c618bfaf() { return handleError(function () {
    const ret = self.self;
    return addHeapObject(ret);
}, arguments) };

export function __wbg_window_55e469842c98b086() { return handleError(function () {
    const ret = window.window;
    return addHeapObject(ret);
}, arguments) };

export function __wbg_globalThis_d0957e302752547e() { return handleError(function () {
    const ret = globalThis.globalThis;
    return addHeapObject(ret);
}, arguments) };

export function __wbg_global_ae2f87312b8987fb() { return handleError(function () {
    const ret = global.global;
    return addHeapObject(ret);
}, arguments) };

export function __wbindgen_is_undefined(arg0) {
    const ret = getObject(arg0) === undefined;
    return ret;
};

export function __wbg_newnoargs_e643855c6572a4a8(arg0, arg1) {
    const ret = new Function(getStringFromWasm0(arg0, arg1));
    return addHeapObject(ret);
};

export function __wbg_call_f96b398515635514() { return handleError(function (arg0, arg1) {
    const ret = getObject(arg0).call(getObject(arg1));
    return addHeapObject(ret);
}, arguments) };

export function __wbg_resolve_f3a7b38cd2af0fa4(arg0) {
    const ret = Promise.resolve(getObject(arg0));
    return addHeapObject(ret);
};

export function __wbg_then_65c9631eb0022205(arg0, arg1) {
    const ret = getObject(arg0).then(getObject(arg1));
    return addHeapObject(ret);
};

export function __wbg_then_cde1713a812adbda(arg0, arg1, arg2) {
    const ret = getObject(arg0).then(getObject(arg1), getObject(arg2));
    return addHeapObject(ret);
};

export function __wbg_length_d9c4ded7e708c6a1(arg0) {
    const ret = getObject(arg0).length;
    return ret;
};

export function __wbindgen_debug_string(arg0, arg1) {
    const ret = debugString(getObject(arg1));
    const ptr1 = passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len1 = WASM_VECTOR_LEN;
    getInt32Memory0()[arg0 / 4 + 1] = len1;
    getInt32Memory0()[arg0 / 4 + 0] = ptr1;
};

export function __wbg_measure_aa7a73f17813f708() { return handleError(function (arg0, arg1, arg2, arg3) {
    let deferred0_0;
    let deferred0_1;
    let deferred1_0;
    let deferred1_1;
    try {
        deferred0_0 = arg0;
        deferred0_1 = arg1;
        deferred1_0 = arg2;
        deferred1_1 = arg3;
        performance.measure(getStringFromWasm0(arg0, arg1), getStringFromWasm0(arg2, arg3));
    } finally {
        wasm.__wbindgen_free(deferred0_0, deferred0_1);
        wasm.__wbindgen_free(deferred1_0, deferred1_1);
    }
}, arguments) };

export function __wbindgen_throw(arg0, arg1) {
    throw new Error(getStringFromWasm0(arg0, arg1));
};

export function __wbg_instanceof_WebGl2RenderingContext_13a2fd72e6509891(arg0) {
    let result;
    try {
        result = getObject(arg0) instanceof WebGL2RenderingContext;
    } catch {
        result = false;
    }
    const ret = result;
    return ret;
};

export function __wbg_innerWidth_5c3a8e1cc043fe23() { return handleError(function (arg0) {
    const ret = getObject(arg0).innerWidth;
    return addHeapObject(ret);
}, arguments) };

export function __wbg_innerHeight_a56709a60e00b4d3() { return handleError(function (arg0) {
    const ret = getObject(arg0).innerHeight;
    return addHeapObject(ret);
}, arguments) };

export function __wbg_devicePixelRatio_6a3c6863df6c69eb(arg0) {
    const ret = getObject(arg0).devicePixelRatio;
    return ret;
};

export function __wbg_matchMedia_65feed2dff6a9d41() { return handleError(function (arg0, arg1, arg2) {
    const ret = getObject(arg0).matchMedia(getStringFromWasm0(arg1, arg2));
    return isLikeNone(ret) ? 0 : addHeapObject(ret);
}, arguments) };

export function __wbg_open_048c640cb28c4c8a() { return handleError(function (arg0, arg1, arg2, arg3, arg4) {
    const ret = getObject(arg0).open(getStringFromWasm0(arg1, arg2), getStringFromWasm0(arg3, arg4));
    return isLikeNone(ret) ? 0 : addHeapObject(ret);
}, arguments) };

export function __wbg_get_275b7fe33126fd53(arg0, arg1, arg2) {
    const ret = getObject(arg0)[getStringFromWasm0(arg1, arg2)];
    return isLikeNone(ret) ? 0 : addHeapObject(ret);
};

export function __wbg_cancelAnimationFrame_7b826433b6b12f73() { return handleError(function (arg0, arg1) {
    getObject(arg0).cancelAnimationFrame(arg1);
}, arguments) };

export function __wbg_clearTimeout_c858b1cf4a2dab60(arg0, arg1) {
    getObject(arg0).clearTimeout(arg1);
};

export function __wbg_videoWidth_d2527c6815290c0d(arg0) {
    const ret = getObject(arg0).videoWidth;
    return ret;
};

export function __wbg_videoHeight_5621215e6f19c3a0(arg0) {
    const ret = getObject(arg0).videoHeight;
    return ret;
};

export function __wbg_code_03601b564d0df7dc(arg0, arg1) {
    const ret = getObject(arg1).code;
    const ptr1 = passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len1 = WASM_VECTOR_LEN;
    getInt32Memory0()[arg0 / 4 + 1] = len1;
    getInt32Memory0()[arg0 / 4 + 0] = ptr1;
};

export function __wbg_matches_80b259c678eefdb2(arg0) {
    const ret = getObject(arg0).matches;
    return ret;
};

export function __wbg_addListener_66d938201dfd7aa7() { return handleError(function (arg0, arg1) {
    getObject(arg0).addListener(getObject(arg1));
}, arguments) };

export function __wbg_removeListener_25c7276a825f0fe0() { return handleError(function (arg0, arg1) {
    getObject(arg0).removeListener(getObject(arg1));
}, arguments) };

export function __wbg_width_f26e0b0eb83e1a90(arg0) {
    const ret = getObject(arg0).width;
    return ret;
};

export function __wbg_height_51fcb2f08e927962(arg0) {
    const ret = getObject(arg0).height;
    return ret;
};

export function __wbg_fullscreenElement_fbdfd30c2328e325(arg0) {
    const ret = getObject(arg0).fullscreenElement;
    return isLikeNone(ret) ? 0 : addHeapObject(ret);
};

export function __wbg_createElement_5281e2aae74efc9d() { return handleError(function (arg0, arg1, arg2) {
    const ret = getObject(arg0).createElement(getStringFromWasm0(arg1, arg2));
    return addHeapObject(ret);
}, arguments) };

export function __wbg_exitFullscreen_59fca9e2f02fdae8(arg0) {
    getObject(arg0).exitFullscreen();
};

export function __wbg_exitPointerLock_10ff7f521e48765b(arg0) {
    getObject(arg0).exitPointerLock();
};

export function __wbg_deltaX_a2649ab8c4f09398(arg0) {
    const ret = getObject(arg0).deltaX;
    return ret;
};

export function __wbg_deltaY_98e91422e318cb8a(arg0) {
    const ret = getObject(arg0).deltaY;
    return ret;
};

export function __wbg_deltaMode_90fac2815fd3b6a6(arg0) {
    const ret = getObject(arg0).deltaMode;
    return ret;
};

export function __wbg_setwidth_885d5dd3c7f48f41(arg0, arg1) {
    getObject(arg0).width = arg1 >>> 0;
};

export function __wbg_setheight_0d2b445bb6a5a3f2(arg0, arg1) {
    getObject(arg0).height = arg1 >>> 0;
};

export function __wbg_getContext_cdb33634d45dc84d() { return handleError(function (arg0, arg1, arg2, arg3) {
    const ret = getObject(arg0).getContext(getStringFromWasm0(arg1, arg2), getObject(arg3));
    return isLikeNone(ret) ? 0 : addHeapObject(ret);
}, arguments) };

export function __wbg_width_55bb2abd121c8b65(arg0) {
    const ret = getObject(arg0).width;
    return ret;
};

export function __wbg_height_ccea9e160474249c(arg0) {
    const ret = getObject(arg0).height;
    return ret;
};

export function __wbindgen_closure_wrapper28943(arg0, arg1, arg2) {
    const ret = makeMutClosure(arg0, arg1, 22357, __wbg_adapter_32);
    return addHeapObject(ret);
};

export function __wbindgen_closure_wrapper28945(arg0, arg1, arg2) {
    const ret = makeMutClosure(arg0, arg1, 22357, __wbg_adapter_32);
    return addHeapObject(ret);
};

export function __wbindgen_closure_wrapper28947(arg0, arg1, arg2) {
    const ret = makeMutClosure(arg0, arg1, 22357, __wbg_adapter_32);
    return addHeapObject(ret);
};

export function __wbindgen_closure_wrapper28949(arg0, arg1, arg2) {
    const ret = makeMutClosure(arg0, arg1, 22357, __wbg_adapter_32);
    return addHeapObject(ret);
};

export function __wbindgen_closure_wrapper28951(arg0, arg1, arg2) {
    const ret = makeMutClosure(arg0, arg1, 22357, __wbg_adapter_32);
    return addHeapObject(ret);
};

export function __wbindgen_closure_wrapper28953(arg0, arg1, arg2) {
    const ret = makeMutClosure(arg0, arg1, 22357, __wbg_adapter_32);
    return addHeapObject(ret);
};

export function __wbindgen_closure_wrapper28955(arg0, arg1, arg2) {
    const ret = makeMutClosure(arg0, arg1, 22357, __wbg_adapter_45);
    return addHeapObject(ret);
};

export function __wbindgen_closure_wrapper28957(arg0, arg1, arg2) {
    const ret = makeMutClosure(arg0, arg1, 22357, __wbg_adapter_32);
    return addHeapObject(ret);
};

export function __wbindgen_closure_wrapper28959(arg0, arg1, arg2) {
    const ret = makeMutClosure(arg0, arg1, 22357, __wbg_adapter_32);
    return addHeapObject(ret);
};

export function __wbindgen_closure_wrapper34962(arg0, arg1, arg2) {
    const ret = makeMutClosure(arg0, arg1, 24616, __wbg_adapter_52);
    return addHeapObject(ret);
};

export function __wbindgen_closure_wrapper38131(arg0, arg1, arg2) {
    const ret = makeMutClosure(arg0, arg1, 25654, __wbg_adapter_55);
    return addHeapObject(ret);
};

