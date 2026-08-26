import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState, type CSSProperties, type HTMLAttributes, type Key, type ReactNode, type RefObject } from 'react';
import { Button as AriaButton, Radio as AriaRadio, RadioGroup as AriaRadioGroup, ToggleButton as AriaToggleButton, type ButtonProps as AriaButtonProps, type ToggleButtonProps as AriaToggleButtonProps } from 'react-aria-components';
import { Ripple, useRipple } from '../../internal/ripple';
import { Button, ElevatedButton, FilledTonalButton, OutlinedButton, TextButton, type ButtonProps } from '../Button';
import { getButtonStyle } from '../Button/Button.defaults';
import { FilledIconButton } from '../IconButton';
import { buttonGroupStyle, defaultButtonGroupExpandedRatio, distributePressedWidths, visiblePrefixCount, type ButtonGroupSize } from './ButtonGroup.defaults';
import './button-group.css';

export type ButtonGroupSelectionMode = 'single' | 'multiple';
export type ButtonGroupButtonVariant = 'filled' | 'elevated' | 'filledTonal' | 'outlined' | 'text';
interface ItemBase { id: Key; label: ReactNode; startIcon?: ReactNode; endIcon?: ReactNode; isDisabled?: boolean; }
export interface ButtonGroupActionItem extends ItemBase { onAction: () => void; menuLabel?: ReactNode; buttonVariant?: ButtonGroupButtonVariant; }
export interface ConnectedButtonGroupItem extends ItemBase {}
interface CommonProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children' | 'onChange'> { size?: ButtonGroupSize; }
export interface StandardButtonGroupProps extends CommonProps { variant?: 'standard'; items: readonly ButtonGroupActionItem[]; expandedRatio?: number; overflowLabel?: string; selectionMode?: never; selectedKey?: never; defaultSelectedKey?: never; selectedKeys?: never; defaultSelectedKeys?: never; onSelectionChange?: never; }
interface ConnectedBase extends CommonProps { variant: 'connected'; items: readonly ConnectedButtonGroupItem[]; expandedRatio?: never; overflowLabel?: never; }
export interface ConnectedSingleButtonGroupProps extends ConnectedBase { selectionMode: 'single'; selectedKey?: Key | null; defaultSelectedKey?: Key | null; onSelectionChange?: (key: Key) => void; selectedKeys?: never; defaultSelectedKeys?: never; }
export interface ConnectedMultipleButtonGroupProps extends ConnectedBase { selectionMode: 'multiple'; selectedKeys?: Iterable<Key>; defaultSelectedKeys?: Iterable<Key>; onSelectionChange?: (keys: Set<Key>) => void; selectedKey?: never; defaultSelectedKey?: never; }
export type ConnectedButtonGroupProps = ConnectedSingleButtonGroupProps | ConnectedMultipleButtonGroupProps;
export type ButtonGroupProps = StandardButtonGroupProps | ConnectedButtonGroupProps;

const actions = { filled: Button, elevated: ElevatedButton, filledTonal: FilledTonalButton, outlined: OutlinedButton, text: TextButton } as const;
const cn = (...v: Array<string | undefined | false>) => v.filter(Boolean).join(' ');
const keys = (v?: Iterable<Key>) => new Set(v ?? []);
function MoreIcon() { return <svg aria-hidden="true" focusable="false" viewBox="0 0 24 24"><circle cx="12" cy="5" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="12" cy="19" r="2"/></svg>; }

function Action({ item, size, ...events }: { item: ButtonGroupActionItem; size: ButtonGroupSize; onPressStart?: ButtonProps['onPressStart']; onPressEnd?: ButtonProps['onPressEnd']; onFocus?: ButtonProps['onFocus']; onBlur?: ButtonProps['onBlur'] }) {
  const C = actions[item.buttonVariant ?? 'filled'];
  return <C {...events} data-button-group-item={String(item.id)} isDisabled={item.isDisabled} size={size} startIcon={item.startIcon} endIcon={item.endIcon} onPress={item.onAction}>{item.label}</C>;
}

function Measure({ items, size, rowRef, overflowRef }: { items: readonly ButtonGroupActionItem[]; size: ButtonGroupSize; rowRef: RefObject<HTMLDivElement | null>; overflowRef: RefObject<HTMLSpanElement | null> }) {
  return <div aria-hidden="true" className="button-group__measure" ref={rowRef}>{items.map(i => <span className="button-group__measure-item" key={i.id}><Action item={i} size={size}/></span>)}<span className="button-group__measure-overflow" ref={overflowRef}><FilledIconButton aria-label="More options" size={size}><MoreIcon/></FilledIconButton></span></div>;
}

function Overflow({ items, label, size, triggerRef }: { items: readonly ButtonGroupActionItem[]; label: string; size: ButtonGroupSize; triggerRef: RefObject<HTMLSpanElement | null> }) {
  const [open, setOpen] = useState(false); const menuRef = useRef<HTMLDivElement>(null);
  const focusTrigger = () => triggerRef.current?.querySelector<HTMLButtonElement>('button')?.focus();
  useEffect(() => { if (!open) return; const pointer = (e: PointerEvent) => { const n=e.target as Node|null; if (!menuRef.current?.contains(n) && !triggerRef.current?.contains(n)) setOpen(false); }; const key=(e:KeyboardEvent)=>{ if(e.key==='Escape'){e.preventDefault();setOpen(false);focusTrigger();}}; document.addEventListener('pointerdown',pointer);document.addEventListener('keydown',key);return()=>{document.removeEventListener('pointerdown',pointer);document.removeEventListener('keydown',key);}; }, [open]);
  useEffect(() => { if (open) menuRef.current?.querySelector<HTMLButtonElement>('[role="menuitem"]:not(:disabled)')?.focus(); }, [open]);
  return <span className="button-group__overflow"><span className="button-group__overflow-trigger" ref={triggerRef}><FilledIconButton aria-expanded={open} aria-haspopup="menu" aria-label={label} size={size} onPress={()=>setOpen(v=>!v)}><MoreIcon/></FilledIconButton></span>{open?<div className="button-group__menu" role="menu" ref={menuRef}>{items.map(i=><button className="button-group__menu-item" disabled={i.isDisabled} key={i.id} role="menuitem" type="button" onClick={()=>{i.onAction();setOpen(false);focusTrigger();}}>{i.startIcon?<span aria-hidden="true" className="button-group__menu-icon">{i.startIcon}</span>:null}<span>{i.menuLabel??i.label}</span></button>)}</div>:null}</span>;
}

function Standard({ items, size='small', expandedRatio=defaultButtonGroupExpandedRatio, overflowLabel='More options', className, style, ...props }: StandardButtonGroupProps) {
  const root=useRef<HTMLDivElement>(null), measure=useRef<HTMLDivElement>(null), overflowMeasure=useRef<HTMLSpanElement>(null), overflowTrigger=useRef<HTMLSpanElement>(null);
  const [metrics,setMetrics]=useState<Array<{width:number;start:number;end:number}>>([]), [visible,setVisible]=useState(items.length), [pressed,setPressed]=useState<Key|null>(null); const focused=useRef<Key|null>(null), focusOverflow=useRef(false);
  const recalc=useCallback(()=>{ if(!root.current||!measure.current)return; const els=[...measure.current.querySelectorAll<HTMLElement>('.button-group__measure-item')]; if(els.length!==items.length)return; const next=els.map(el=>{const b=el.querySelector<HTMLElement>('.button');const c=b?getComputedStyle(b):null;return{width:el.getBoundingClientRect().width,start:Number.parseFloat(c?.paddingInlineStart??'0')||0,end:Number.parseFloat(c?.paddingInlineEnd??'0')||0};}); const gap=Number.parseFloat(getComputedStyle(root.current).columnGap)||0; const count=visiblePrefixCount(next.map(m=>m.width),root.current.getBoundingClientRect().width,gap,overflowMeasure.current?.getBoundingClientRect().width??0); const fi=focused.current==null?-1:items.findIndex(i=>i.id===focused.current); if(fi>=count&&count<items.length)focusOverflow.current=true; setMetrics(next);setVisible(count);},[items]);
  useLayoutEffect(()=>{recalc();if(!root.current||!measure.current||typeof ResizeObserver==='undefined')return;const ro=new ResizeObserver(recalc);ro.observe(root.current);ro.observe(measure.current);return()=>ro.disconnect();},[recalc,size]);
  useEffect(()=>{const pi=pressed==null?-1:items.findIndex(i=>i.id===pressed);if(pi<0||pi>=visible)setPressed(null);if(focusOverflow.current&&visible<items.length){focusOverflow.current=false;overflowTrigger.current?.querySelector<HTMLButtonElement>('button')?.focus();focused.current=null;}},[items,pressed,visible]);
  const shown=items.slice(0,visible), overflow=items.slice(visible), vm=metrics.slice(0,visible), pi=pressed==null?-1:shown.findIndex(i=>i.id===pressed), ratio=Number.isFinite(expandedRatio)?Math.min(1,Math.max(0,expandedRatio)):defaultButtonGroupExpandedRatio;
  const widths=distributePressedWidths({widths:vm.map(m=>m.width),maxCompression:vm.map((m,i)=>pi<0?0:i<pi?m.end:i>pi?m.start:0),pressedIndex:pi>=0?pi:null,expandedRatio:ratio});
  return <div {...props} className={cn('button-group','button-group--standard',className)} data-size={size} data-variant="standard" ref={root} role={props.role??'group'} style={{...buttonGroupStyle('standard',size),...style} as CSSProperties}><Measure items={items} size={size} rowRef={measure} overflowRef={overflowMeasure}/><div className="button-group__row">{shown.map((item,i)=><span className="button-group__item" data-item-id={String(item.id)} key={item.id} style={widths[i]!=null?{inlineSize:`${widths[i]}px`}:undefined}><Action item={item} size={size} onBlur={()=>{if(focused.current===item.id)focused.current=null;}} onFocus={()=>{focused.current=item.id;}} onPressStart={()=>setPressed(item.id)} onPressEnd={()=>setPressed(v=>v===item.id?null:v)}/></span>)}{overflow.length?<Overflow items={overflow} label={overflowLabel} size={size} triggerRef={overflowTrigger}/>:null}</div></div>;
}

function ConnectedItem({ item,index,count,selected,mode,size,onChange }: { item:ConnectedButtonGroupItem;index:number;count:number;selected:boolean;mode:ButtonGroupSelectionMode;size:ButtonGroupSize;onChange:(v:boolean)=>void }) {
  const ripple=useRipple(), position=count===1?'only':index===0?'leading':index===count-1?'trailing':'middle';
  const data={ 'aria-label':typeof item.label==='string'?item.label:undefined,'data-position':position,'data-selected':selected||undefined,'data-button-group-item':String(item.id),'data-item-index':index,isDisabled:item.isDisabled,className:'button button-group__connected-item' } as const;
  const content=(p:{isFocusVisible:boolean;isHovered:boolean})=><><Ripple controller={ripple} focusRingRadius="inherit" isFocusVisible={p.isFocusVisible} isHovered={p.isHovered}/><span className="button__content">{item.startIcon?<span aria-hidden="true" className="button__icon">{item.startIcon}</span>:null}{item.label}{item.endIcon?<span aria-hidden="true" className="button__icon">{item.endIcon}</span>:null}</span></>;
  const style=(p:{isDisabled:boolean;isFocusVisible:boolean;isHovered:boolean;isPressed:boolean})=>({...getButtonStyle('filled',{isDisabled:p.isDisabled,interaction:p.isPressed?'press':p.isHovered?'hover':p.isFocusVisible?'focus':null},{size}),'--_button-container-color':selected?'var(--_button-group-selected-container)':'var(--_button-group-unselected-container)','--_button-content-color':selected?'var(--_button-group-selected-content)':'var(--_button-group-unselected-content)'}) as CSSProperties;
  if(mode==='single')return <AriaRadio {...data} value={String(index)} style={style} onPressStart={e=>ripple.onPressStart(e)} onPressEnd={()=>ripple.onPressEnd()}>{content}</AriaRadio>;
  const tp:AriaToggleButtonProps={...data,isSelected:selected,onChange,style,children:content,onPressStart:e=>ripple.onPressStart(e),onPressEnd:()=>ripple.onPressEnd()};return <AriaToggleButton {...tp}/>;
}

function Connected(props: ConnectedButtonGroupProps) {
  const {items,selectionMode,size='small',className,style,...rest}=props; const singleCtl=selectionMode==='single'&&props.selectedKey!==undefined, multiCtl=selectionMode==='multiple'&&props.selectedKeys!==undefined;
  const [single,setSingle]=useState<Key|null>(()=>selectionMode==='single'?(props.defaultSelectedKey??null):null), [multi,setMulti]=useState<Set<Key>>(()=>selectionMode==='multiple'?keys(props.defaultSelectedKeys):new Set());
  const ctlMulti=useMemo(()=>selectionMode==='multiple'?keys(props.selectedKeys):new Set<Key>(),[props.selectedKeys,selectionMode]); const singleValue=selectionMode==='single'?(singleCtl?(props.selectedKey??null):single):null, multiValue=selectionMode==='multiple'?(multiCtl?ctlMulti:multi):new Set<Key>();
  const change=useCallback((id:Key,on:boolean)=>{if(selectionMode==='single'){if(!on)return;if(!singleCtl)setSingle(id);props.onSelectionChange?.(id);}else{const n=new Set(multiValue);on?n.add(id):n.delete(id);if(!multiCtl)setMulti(n);props.onSelectionChange?.(new Set(n));}},[multiCtl,multiValue,props,selectionMode,singleCtl]);
  const html={...rest} as HTMLAttributes<HTMLDivElement>; for(const k of ['selectedKey','defaultSelectedKey','selectedKeys','defaultSelectedKeys','onSelectionChange'] as const) delete (html as Record<string,unknown>)[k];
  const ariaLabel=html['aria-label'], ariaLabelledBy=html['aria-labelledby']; delete html['aria-label']; delete html['aria-labelledby']; const userKey=html.onKeyDown; delete html.onKeyDown;
  const root=<div {...html} className={cn('button-group','button-group--connected',className)} data-selection-mode={selectionMode} data-size={size} data-variant="connected" role={selectionMode==='multiple'?(html.role??'group'):undefined} style={{...buttonGroupStyle('connected',size),...style} as CSSProperties}/>;
  if(selectionMode==='single'){
    const selectedIndex=items.findIndex(i=>i.id===singleValue);
    return <div {...root.props}><AriaRadioGroup aria-label={ariaLabel} aria-labelledby={ariaLabelledBy} className="button-group__row" orientation="horizontal" value={selectedIndex>=0?String(selectedIndex):''} onChange={value=>{const index=Number(value);const item=items[index];if(item&&!item.isDisabled)change(item.id,true);}}>{items.map((item,i)=><ConnectedItem item={item} index={i} count={items.length} selected={singleValue===item.id} key={item.id} mode="single" size={size} onChange={()=>{}}/>)}</AriaRadioGroup></div>;
  }
  return <div {...root.props} onKeyDown={userKey}><div className="button-group__row">{items.map((item,i)=><ConnectedItem item={item} index={i} count={items.length} selected={multiValue.has(item.id)} key={item.id} mode="multiple" size={size} onChange={v=>{if(!item.isDisabled)change(item.id,v);}}/>)}</div></div>;
}

export function ButtonGroup(props: ButtonGroupProps) { return props.variant==='connected'?<Connected {...props}/>:<Standard {...props}/>; }
