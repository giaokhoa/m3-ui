import { useState } from 'react';
import {
  AppBarColumn,
  AppBarRow,
  ElevatedToggleButton,
  FilledTonalToggleButton,
  FloatingActionButtonMenu,
  FloatingActionButtonMenuItem,
  OutlinedToggleButton,
  ToggleButton,
  ToggleFloatingActionButton,
  type AppBarAction,
} from '@m3-ui/ui';
import './action-overflow-demos.css';

function PlusIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24">
      <path d="M11 5h2v6h6v2h-6v6h-2v-6H5v-2h6V5Z" fill="currentColor" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24">
      <path d="m6.7 5.3 5.3 5.3 5.3-5.3 1.4 1.4-5.3 5.3 5.3 5.3-1.4 1.4-5.3-5.3-5.3 5.3-1.4-1.4 5.3-5.3-5.3-5.3 1.4-1.4Z" fill="currentColor" />
    </svg>
  );
}

function EditIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24">
      <path d="M4 17.3V20h2.7l8-8-2.7-2.7-8 8Zm12.8-7.4a.7.7 0 0 0 0-1l-1.7-1.7a.7.7 0 0 0-1 0l-1.3 1.3 2.7 2.7 1.3-1.3Z" fill="currentColor" />
    </svg>
  );
}

function ShareIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24">
      <path d="M18 16.1c-.8 0-1.5.3-2 .8l-7.1-4.1c.1-.3.1-.5.1-.8s0-.5-.1-.8L16 7.1c.5.5 1.2.8 2 .8a3 3 0 1 0-3-3c0 .3 0 .5.1.8L8 9.8a3 3 0 1 0 0 4.4l7.1 4.1c-.1.2-.1.5-.1.7a3 3 0 1 0 3-2.9Z" fill="currentColor" />
    </svg>
  );
}

function TinyIcon({ children }: { children: string }) {
  return (
    <span aria-hidden="true" className="docs-action-overflow__tiny-icon">
      {children}
    </span>
  );
}

export function ToggleButtonPreview() {
  const [filled, setFilled] = useState(false);
  const [elevated, setElevated] = useState(true);
  const [tonal, setTonal] = useState(false);
  const [outlined, setOutlined] = useState(true);

  return (
    <div className="docs-action-overflow__toggle-grid">
      <ToggleButton isSelected={filled} onChange={setFilled} startIcon={<PlusIcon />}>
        Filled
      </ToggleButton>
      <ElevatedToggleButton isSelected={elevated} onChange={setElevated}>
        Elevated
      </ElevatedToggleButton>
      <FilledTonalToggleButton isSelected={tonal} onChange={setTonal}>
        Tonal
      </FilledTonalToggleButton>
      <OutlinedToggleButton isSelected={outlined} onChange={setOutlined}>
        Outlined
      </OutlinedToggleButton>
    </div>
  );
}

export function FabMenuPreview() {
  const [expanded, setExpanded] = useState(true);
  const [lastAction, setLastAction] = useState('None');
  const act = (label: string) => {
    setLastAction(label);
    setExpanded(false);
  };

  return (
    <div className="docs-action-overflow__fab-stage">
      <output className="docs-action-overflow__output">Last action: {lastAction}</output>
      <div className="docs-action-overflow__fab-anchor">
        <FloatingActionButtonMenu
          aria-label="Create actions"
          expanded={expanded}
          trigger={
            <ToggleFloatingActionButton
              aria-label="Create actions"
              checked={expanded}
              checkedIcon={<CloseIcon />}
              icon={<PlusIcon />}
              onCheckedChange={setExpanded}
            />
          }
        >
          <FloatingActionButtonMenuItem icon={<EditIcon />} onPress={() => act('Edit')}>
            Edit
          </FloatingActionButtonMenuItem>
          <FloatingActionButtonMenuItem icon={<ShareIcon />} onPress={() => act('Share')}>
            Share
          </FloatingActionButtonMenuItem>
        </FloatingActionButtonMenu>
      </div>
    </div>
  );
}

export function AppBarOverflowPreview() {
  const [selected, setSelected] = useState(false);
  const [lastAction, setLastAction] = useState('None');
  const items: AppBarAction[] = [
    {
      type: 'action',
      id: 'share',
      label: 'Share',
      icon: <TinyIcon>↗</TinyIcon>,
      onPress: () => setLastAction('Share'),
    },
    {
      type: 'toggle',
      id: 'pin',
      label: 'Pin',
      icon: <TinyIcon>●</TinyIcon>,
      isSelected: selected,
      onChange: (next) => {
        setSelected(next);
        setLastAction(next ? 'Pin on' : 'Pin off');
      },
    },
    {
      type: 'action',
      id: 'archive',
      label: 'Archive',
      icon: <TinyIcon>□</TinyIcon>,
      onPress: () => setLastAction('Archive'),
    },
    {
      type: 'action',
      id: 'settings',
      label: 'Settings',
      icon: <TinyIcon>⚙</TinyIcon>,
      onPress: () => setLastAction('Settings'),
    },
  ];

  return (
    <div className="docs-action-overflow__app-bars">
      <output className="docs-action-overflow__output">Last action: {lastAction}</output>
      <div className="docs-action-overflow__row-host">
        <AppBarRow aria-label="Document actions" items={items} />
      </div>
      <div className="docs-action-overflow__column-host">
        <AppBarColumn aria-label="Document actions" items={items} />
      </div>
    </div>
  );
}
