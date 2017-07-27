# Substance

<!-- TODO: Add Table of Contents for quick navigation -->

Substance is a __library__ for creating web-based __WYSIWIG editors__. With all the features you would expect from a WYSIWIG editor.

As opposed to other existing editors, such as TinyMCE, Aloha, etc. Substance is __not__ just __a widget__ you include into your web-application.

The unique point of Substance: __Customizability__. You can __customize everything__. And we try to make this as simple as possible for you.

This document explains the major concepts of Substance and help you get started with development. Please note, that not all features are covered in full detail. We are working on complete API docs for version 2.0. Please look at the comments in the source code for full API reference.

## Document Model

It begins with the data. For instance, a scientific article is more complex than a blog post. Still there is some similarity. Both of them have paragraphs, for instance. In Substance you __define a schema__, containing a set of Node descriptions.

```js
var Figure = BlockNode.extend();

Figure.static.name = "figure";

Figure.static.defineSchema({
  "title": "text",
  "img": "src",
  "caption": "text"
})
```

- Introduction to Substance documents
- Define a new document schema
- Define a new node type
- insert data (e.g. create new node, show/hide content in the body)

## Converters

The next thing: Data conversion. Probably you are already using a certain data format, XML files or HTML. With Substance you can create __your own converter__ very easily:

```js
{
  type: 'figure',
  tagName: 'figure',

  import: function(el, node, converter) {
    var title = el.find('.title')
    var img = el.find('img')
    var figcaption = el.find('figcaption')

    node.title = converter.annotatedText(title, [node.id, 'title'])
    node.img = img.attr('src')
    node.caption = converter.annotatedText(figcaption, [node.id, 'caption'])
  },

  export: function(node, el, converter) {
    // title
    el.append($$('h1').addClass('title').append(
      converter.annotatedText([node.id, 'title']))
    )
    // image
    el.append($$('img').attr('src', node.src))
    // caption
    el.append(
      $$('figcaption').append(
        converter.annotatedText([node.id, 'caption'])
      )
    )
    return el
  }
}
```

## Components

- Introduction to Components
- Similar to React
- How to use them? What is $$?
- Component life cycle (didMount, dispose, willReceiveProps, didUpdate)

## Configurator

- Why?
- examples

## EditorSession

- used to manipulate a document

### Selection

- Explain difference between property selection vs. container selection.

### Transactions

- how to start a new transaction to manipulate a document

### CommandStates

- what are they used for?
- how can new commands be defined?

### Update Stages and Resources

When the editor session is updated it goes through different update stages. You can also subscribe to a resource (e.g. the document or the selection)

Stages:

- `update` - fired immediately after a model change
- `pre-render` -  can be used collect information before rendering
- `render` - during rendering
- `post-render` - after rendering, can be used to collect visual data for positioning
- `position` - use this stage for positioning (e.g. the overlay is positioned here)
- `finalize` - use this for cleanup if needed

Resources:

- `document` - document changes
- `selection` - whenever the selection has been updated
- `commandStates` - whenever the commandStates have been changed

For instance you can listen to document changes in your components.

```js
class ImageComponent extends NodeComponent {

  didMount() {
    super.didMount.call(this)
    this.context.editorSession.onRender('document', this._onDocumentChange, this)
  }

  dispose() {
    super.dispose.call(this)
    this.context.editorSession.off(this)
  }

  _onDocumentChange(change) {
    if (change.hasUpdated(this.props.node.id) ||
      change.hasUpdated(this.props.node.imageFile)) {
      this.rerender()
    }
  }
}
```

## Dependency Injection

- why?
- how to use it?
- why can it be dangerous?
- never provide mutable data via DI (final static)

## Toolbars and Overlays

- how to configure tool panels
- how to attach a toolbar / overlay

## Tutorial: Your first editor

Learn how to build a full-fledged editor.

### Installation

Adapt guide `doc/integrating-substance.md`.

### Step 1

Adapt guide `doc/your-first-editor.md` into steps.

### Step 2

### Step N
