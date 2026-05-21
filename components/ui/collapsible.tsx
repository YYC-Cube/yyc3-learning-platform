/**
 * @fileoverview UI组件 · collapsible.tsx
 * @author YYC³ <admin@0379.email>
 * @version 1.0.0
 * @license MIT
 */
'use client';

/**
 * @fileoverview 可折叠面板组件
 * @author YYC³ <admin@0379.email>
 * @version 1.0.0
 * @license MIT */

import * as CollapsiblePrimitive from '@radix-ui/react-collapsible';

const Collapsible = CollapsiblePrimitive.Root;

const CollapsibleTrigger = CollapsiblePrimitive.CollapsibleTrigger;

const CollapsibleContent = CollapsiblePrimitive.CollapsibleContent;

export { Collapsible, CollapsibleTrigger, CollapsibleContent };
