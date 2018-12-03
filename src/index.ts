import {
  IDisposable, DisposableDelegate
} from '@phosphor/disposable';

import {
  JupyterLab, JupyterLabPlugin
} from '@jupyterlab/application';

import {
  ToolbarButton
} from '@jupyterlab/apputils';

import {
  DocumentRegistry
} from '@jupyterlab/docregistry';

import {
  NotebookActions, NotebookPanel, INotebookModel,INotebookTracker
} from '@jupyterlab/notebook';


import { CodeCellModel } from '@jupyterlab/cells';

//import Utilities from '@typescript/utilities';
/**
 * The plugin registration information.
 */
const plugin: JupyterLabPlugin<void> = {
  activate,
  id: 'jupyterlab_twitterfollow:buttonPlugin',
  autoStart: true,
  requires: [INotebookTracker]
};



/**
 * A function that creates a code cell
 */

export function codeCell(code: string) {
    return new CodeCellModel({
        cell: {
            cell_type: 'code',
            metadata: { trusted: false, collapsed: false, tags: ['injected by twitterfollow'] },
            source: [code],
        },
    });
}

/**
 * A notebook widget extension that adds a button to the toolbar.
 */

export
class ButtonExtension implements DocumentRegistry.IWidgetExtension<NotebookPanel, INotebookModel> {
  /**
   * Create a new extension object.
   */
  img: string;
  title: string;
  alt: string;

  getXkcdAPI() {
    //fetch a random Xkcd comic
    fetch('https://egszlpbmle.execute-api.us-east-1.amazonaws.com/prod').then(response => {
      return response.json();
    }).then(data => {
      this.img = data.img;
    });
  }

  insertCode(panel: NotebookPanel, context: DocumentRegistry.IContext<INotebookModel>) {

      const model = panel.content.model; // the notebook object
      const activeCellIndex = panel.content.activeCellIndex; //index of actively selected cell

      this.getXkcdAPI() //fetch a comic

      if (this.img !== undefined) {
          let code = `<img src = ${this.img}>`
          const cell = codeCell(code);
          model.cells.insert(activeCellIndex + 1, cell); //insert code into new cell below
          NotebookActions.selectBelow(panel.content) //select cell below
          NotebookActions.changeCellType(panel.content, 'markdown') //convert to markdown
          NotebookActions.run(panel.content, context.session) //execute the cell
          NotebookActions.selectAbove(panel.content) //select cell above
      }
      
  }

  createNew(panel: NotebookPanel, context: DocumentRegistry.IContext<INotebookModel>) : IDisposable {
    let callback = () => {

      //Insert text
      this.insertCode(panel, context)

    };
    let button = new ToolbarButton({
      className: 'myButton',
      iconClassName: 'fa fa-twitter', // Twitter icon
      onClick: callback,
      tooltip: 'Run All'
    });

    panel.toolbar.insertItem(10, 'runAll', button);

    return new DisposableDelegate(() => {
      button.dispose();
    });
}
}


/**
 * Activate the extension.
 */
function activate(app: JupyterLab, panel: NotebookPanel, context: DocumentRegistry.IContext<INotebookModel>) {
  app.docRegistry.addWidgetExtension('Notebook', new ButtonExtension());
};


/**
 * Export the plugin as default.
 */
export default plugin;
