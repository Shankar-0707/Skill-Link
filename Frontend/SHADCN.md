# shadcn/ui Guide

This project is configured to use **shadcn/ui** components with a custom directory structure.

## Usage

To add a new component to the project, run the following command in the `Frontend` directory:

```bash
npx shadcn@latest add [component-name]
```

### Configuration Details
- **Components Path**: `src/shared/components/ui`
- **Utility Alias**: `@/shared/utils/cn`
- **Tailwind Version**: v4

---

## Available Components

You can add any of these components using the command: `npx shadcn@latest add [component-name]`

### Foundation & Layout
- **Accordion**: A vertically stacked set of interactive headings.
- **Aspect Ratio**: Displays content within a desired ratio.
- **Card**: Contains content and actions about a single subject.
- **Collapsible**: An interactive component which expands/collapses a panel.
- **Resizable**: Accessible resizable panel groups and layouts.
- **Scroll Area**: Custom scrollbars for content that overflows.
- **Separator**: Visually or semantically separates content.

### Navigation
- **Breadcrumb**: Displays the path to the current resource.
- **Menubar**: A visually persistent menu common in desktop applications.
- **Navigation Menu**: A collection of links for navigating websites.
- **Pagination**: Iteration through a series of related content.
- **Tabs**: A set of layered sections of content, known as tab panels.

### Forms & Inputs
- **Button**: Interactive button component (already added).
- **Checkbox**: A control that allows the user to toggle an option.
- **Command**: Fast, composable, unstyled command menu.
- **Form**: Building forms with React Hook Form and Zod.
- **Input**: Basic input field.
- **Label**: Renders an accessible label associated with a control.
- **Radio Group**: A set of checkable buttons where only one can be checked.
- **Select**: Displays a list of options for the user to pick from.
- **Slider**: An input where the user selects a value from a range.
- **Switch**: A control that allows the user to toggle a setting.
- **Textarea**: Multi-line text input field.
- **Toggle**: A two-state button that can be either on or off.
- **Toggle Group**: A set of buttons that can be toggled on or off.

### Data Display
- **Badge**: Displays a badge or a component that looks like a badge.
- **Calendar**: A date field component.
- **Table**: A responsive table component.
- **Skeleton**: Used to show a placeholder while content is loading.

### Feedback & Overlays
- **Alert**: Displays a callout for user attention.
- **Alert Dialog**: A modal dialog that interrupts the user with important content.
- **ContextMenu**: Displays a menu at the pointer location.
- **Dialog**: A window overlaid on either the primary window or another dialog.
- **Drawer**: A panel that slides out from the edge of the screen.
- **Dropdown Menu**: Displays a list of options to the user, triggered by a button.
- **Hover Card**: For card-like content that is revealed on hover.
- **Popover**: Displays rich content in a portal, triggered by a button.
- **Progress**: Displays an indicator showing the completion progress of a task.
- **Toast**: A succinct message that is displayed temporarily.
- **Tooltip**: A popup that displays information related to an element.
- **Carousel**: A slideshow component for cycling through elements.


# To run shadcn library components

npx shadcn@latest add [component-name]