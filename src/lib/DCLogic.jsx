import { Component } from 'react';

/**
 * Small base class used by every page.
 * A page defines renderVals() (state and data for the template)
 * and template(v) (the markup). render() joins the two.
 */
export class DCLogic extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  renderVals() {
    return {};
  }

  template() {
    return null;
  }

  render() {
    return this.template(this.renderVals());
  }
}
