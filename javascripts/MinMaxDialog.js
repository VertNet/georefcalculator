/*
Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.

__author__ = "Craig Wieczorek, John Wieczorek"
__copyright__ = "Copyright 2015 Regents of the University of California"
__version__ = "MinMaxDialog.js 2015-11-23T20:33:00-07:00"
*/


import java.awt.*;

class MinMaxDialog extends java.awt.Dialog {
  Button ok=null;
  Label labelmessage=null;

  public MinMaxDialog(java.awt.Frame owner, String message, String title, int style) {
    super(owner, title, true);
    setLayout(new BorderLayout());
    this.setSize(150,200);
    labelmessage = new Label(message);
    this.add(labelmessage,BorderLayout.NORTH);

    ok=new Button("OK");
    ok.setSize(30,23);
    this.add(ok,BorderLayout.SOUTH);

    setBounds(124,84,150,200);
    pack();
  }

  public boolean action(Event e, Object o){
    if(e.target==ok){
      dispose();
      return(true);
    } else return true;
  }
}
