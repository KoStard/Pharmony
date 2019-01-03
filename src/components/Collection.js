import React, { Component } from 'react';
import './Collection.css';
import CollectionInputBar from './CollectionInputBar';

class Collection extends Component {
  handleInputBarSubmit = value => {
    console.log('Will be submitted ->', value);
  };
  render() {
    const columns = ['ID', 'Name', 'Description'];
    const lower_columns = columns.map(column_name => column_name.toLowerCase());
    let blocksList = this.props.collection.blocks.map((block, index) => {
      return (
        <tr key={block.name}>
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
        <CollectionInputBar handleSubmit={this.handleInputBarSubmit} />
        {table}
      </div>
    );
  }
}

export default Collection;
