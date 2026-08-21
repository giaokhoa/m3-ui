# Text field internals

This directory is reserved for shared internals used by filled and outlined Material text fields.

TextField is intentionally treated as a complex component family because Compose separates the input primitive from decoration/layout behavior. The web port should preserve that architectural separation while using React Aria/native form semantics.

Expected responsibilities:

- floating label layout and transitions;
- leading/trailing icon slots;
- prefix/suffix layout;
- supporting text and error placement;
- filled/outlined container geometry;
- indicator/outline state styling;
- shared state resolution that is independent of the public React component API.

Do not place form semantics or accessibility relationships here if React Aria `TextField`, `Label`, `Input`, `Text`, and `FieldError` already provide them. Internal modules should compose around those semantics, not replace them.
