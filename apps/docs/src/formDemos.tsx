'use client';

import { Button, SecureTextField, TextField } from '@m3-ui/ui';

export function NativeSignInFormPreview() {
  return (
    <form
      onSubmit={(event) => event.preventDefault()}
      style={{ display: 'grid', gap: '1rem', width: 'min(100%, 32rem)' }}
    >
      <TextField
        label="Email"
        name="email"
        type="email"
        autoComplete="email"
        isRequired
        isMultiline={false}
      />
      <SecureTextField
        label="Password"
        name="password"
        autoComplete="current-password"
        isRequired
      />
      <Button type="submit">Sign in</Button>
    </form>
  );
}
