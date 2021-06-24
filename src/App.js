import React from "react";
import { Switch, Route } from "react-router-dom";

import DropzoneS3Uploader from "./DropzoneS3Uploader";

function App() {
  const style = {
    minHeight: "100%",
  };

  return (
    <div className={style}>
      <Switch>
        <Route exact path="/uploadAnswerSheets" component={DropzoneS3Uploader} />
      </Switch>
    </div>
  );
}

export default App;
