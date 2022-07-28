import { ShapeFlags } from "../shared/ShapeFlags";

export function initSlots(instance, children){
    // instance.slots = Array.isArray(children) ? children : [children];

    // 不一定都有children，有children也不一定都是slots类型
    const { vnode } = instance;
    if(vnode.shapeFlag & ShapeFlags.slot_children){
        const slots = {};
        for(const key in children){
            // slot -> function
            const value = children[key];
            slots[key] = (props) => normalizeSlotValue(value(props));
        }
    
        instance.slots = slots;
    }
}

function normalizeSlotValue(value){
    return Array.isArray(value) ? value : [value];
}