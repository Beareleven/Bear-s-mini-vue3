export const enum ShapeFlags  {
    element = 1, 
    stateful_component = 1 << 1,
    text_children = 1 << 2,
    array_children = 1 << 3,
    slot_children = 1 << 4
}

// 位运算 提升性能