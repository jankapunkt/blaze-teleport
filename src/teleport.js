import './teleport.html';

Template.Teleport.onRendered(function () {
  let parentNode = document.body;

  if (this.data && this.data.destination) {
    if (this.data.destination instanceof Element) { // We accept Elements
      parentNode = this.data.destination;
    } else if (typeof this.data.destination === 'string') { // We also accept selectors
      parentNode = document.querySelector(this.data.destination);
      if (!parentNode) throw new Error(`Teleport destination not found: ${this.data.destination}`);
    } else {
      throw new Error('Teleport destination must be an instance of Element or a CSS Selector');
    }
  }

  // Find the view of the Template where the Teleport has been declared by traversing the view Tree.
  // see: https://github.com/meteor/blaze/blob/c6af95632b1a3f5a7077964e25c9be4ddaf7cc42/packages/blaze/view.js#L9
  let parentView = this.view.parentView
  while (parentView.name.indexOf('Template') === -1) {
    parentView = parentView.parentView
  }

  // Connect the parent Template's events and ensure they receive the parents templateInstance as second param
  this.view.templateContentBlock.__eventMaps = parentView.template.__eventMaps
  this.teleported = Blaze.render(this.view.templateContentBlock, parentNode, null, parentView);
  this.teleported.templateInstance = parentView.templateInstance
});

Template.Teleport.onDestroyed(function () {
  Blaze.remove(this.teleported);
});
