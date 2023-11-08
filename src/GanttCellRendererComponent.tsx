import * as React from "react";

export class GanttCellRendererComponent extends React.Component<{}> {
  render(): JSX.Element {
    return (
      <svg height="1000" width="1000">
        <rect x="2" y="2" width="996" height="998" stroke="black" strokeWidth="3" fill="red" />
      </svg>
    );
  }
}

