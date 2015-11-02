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
