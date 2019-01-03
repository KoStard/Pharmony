import React, { Component } from 'react';
import './Collection.css';
import CollectionInputBar from './CollectionInputBar';
import { CLIENT_RENEG_WINDOW } from 'tls';

class Collection extends Component {
  constructor(props) {
    super(props);
    this.collection_input_bar = React.createRef();
  }
  handleInputBarSubmit = value => {
    console.log('Will be submitted ->', value);
  };
  render() {
    const columns = ['ID', 'Name', 'Description'];
    const lower_columns = columns.map(column_name => column_name.toLowerCase());
    let blocksList = this.props.collection.blocks.map((block, index) => {
      return (
        <tr
          key={block.name}
          onDoubleClick={e => {
            if (e.ctrlKey) {
              this.collection_input_bar.current.openBlockToRename(block);
            } else {
              this.collection_input_bar.current.openBlock(block);
            }
          }}
        >
          {lower_columns.map((column_name, column_index) => (
            <td
              key={`${block.name}-${column_name}`}
              className={`${column_name}-column-cell`}
            >
              {column_index ? block[column_name] : index + 1}
            </td>
          ))}
        </tr>
      );
    });
    let table = (
      <table>
        <thead>
          <tr>
            {columns.map(column_name => (
              <th
                key={`column_name_${column_name}`}
                className={`${column_name.toLowerCase()}-header-cell`}
              >
                {column_name}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>{blocksList}</tbody>
      </table>
    );
    return (
      <div id="collection-container">
        <CollectionInputBar
          handleSubmit={this.handleInputBarSubmit}
          collection={this.props.collection}
          ref={this.collection_input_bar}
        />
        {table}
      </div>
    );
  }
}

export default Collection;
