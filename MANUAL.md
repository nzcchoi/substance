# Substance

<!-- TODO: Add Table of Contents for quick navigation -->

Substance is a __library__ for creating web-based __WYSIWIG editors__. With all the features you would expect from a WYSIWIG editor.

As opposed to other existing editors, such as TinyMCE, Aloha, etc. Substance is __not__ just __a widget__ you include into your web-application.

The unique point of Substance: __Customizability__. You can __customize everything__. And we try to make this as simple as possible for you.

This document explains the major concepts of Substance and help you get started with development. Please note, that not all features are covered in full detail. We are working on complete API docs for version 2.0. Please look at the comments in the source code for full API reference.

## Document Model

<!-- It begins with the data. For instance, a scientific article is more complex than a blog post. Still there is some similarity. Both of them have paragraphs, for instance. In Substance you __define a schema__, containing a set of Node descriptions. -->

TODO: Needs simple intro.

This is how you define a node type:

```js
class Heading extends TextBlock {}

Heading.schema = {
  type: "heading",
  level: { type: "number", default: 1 }
}
```

### Node Classes

When you add support for a new element, you have to choose a Substance node type. Use this check list to find out what kind of element it is.

#### TextBlock

- Does the element contain annotated text?
- Is it part of a container? (can be moved around)

Example elements: `<paragraph>`, `<heading>`

#### PropertyAnnotation

- Is the element used for formatting, highlighting?
- Can the cursor move inside the element, changing its text?

Example elements: `<strong>`, `<emphasis>`, `<hyperlink>`

#### InlineNode

- Does the element behave like a single text character in the text flow?
- Is the element content generated (e.g. a label)?
- Is the element content a graphic?
- Is the content of the node immutable to text editing and can only be deleted as a whole?

Example elements: `<xref>`

#### Container

- Does the element define a sequence of nodes?
- Can the order of the nodes be changed by the user?

#### DocumentNode

- Does your element not fit into any of the previous types?
- Is your element a block image?
- Is your element a table?

### Define a schema

```js
let schema =  new DocumentSchema({
  name: 'simple-article',
  DocumentClass: Document,
  defaultTextType: 'paragraph'
})
this.schema.addNodes([Title, Body, Paragraph])
```

### Create an empty document instance

```js
let doc = new Document(schema)
```

Next we want to populate the document with content. There are different ways to it, but the recommended way is writing converters.

## Converters

Substance is designed to work with XML as a data representation format. This gives you the opportunity to model a completely custom content model for your documents. Let's assume the following simple XML document.

```xml
<simple-article>
  <title>Hello Substance</title>
  <body>
    <paragraph>Hello <emphasis>Substance</emphasis></paragraph>
    <figure image-source="figure1.png">
      <title>Figure 1</title>
      <caption>Lorem ipsum</caption>
    </figure>
  </body>
</simple-article>
```

We need to provide converters for all elements (title, body, paragraph, figure, caption). A converter simply converts from DOM elements to Substance Nodes, which are regular Javascript objects.

The following code shows the converter for the figure node type.

```js
export default {
  type: 'figure',
  tagName: 'figure',

  import: function(el, node, converter) {
    var title = el.find('title')
    var caption = el.find('caption')
    node.imageSource = el.attr('image-source')
    node.title = converter.convertElement(title).id
    node.caption = converter.convertElement(caption).id
  },

  export: function(node, el, converter) {
    el.attr('image-source', node.imageSource)
    el.append(converter.convertNode(node.title))
    el.append(converter.convertNode(node.caption))
  }
}
```

And here's a converter that reads the `<title>` element and turns it into a title node.

```js
export default {

  type: 'title',
  tagName: 'title',

  import: function(el, node, converter) {
    node.content = converter.annotatedText(el, [node.id, 'content'])
  },

  export: function(node, el, converter) {
    el.append(converter.annotatedText([node.id, 'content']))
  }

}
```

And here's a converter that just maps the emphasis element to an emphasis node. No data is carries, so there is no need to implement import and export functions.

```js
export default {
  type: 'subscript',
  tagName: 'sub'
}
```

## Configurator

- Why?
- examples

## DocumentSession

## Components

- Introduction to Components
- Similar to React
- How to use them? What is $$?
- Component life cycle (didMount, dispose, willReceiveProps, didUpdate)



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
