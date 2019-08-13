import React, {Component} from 'react';
import moment from 'moment';

class Feedback extends Component {

  constructor(props) {
    super(props)
    this.state = {
      selectedFeedbackMessage: null
    };

    this.handleFeedbackView = this.handleFeedbackView.bind(this);
    this.close = this.close.bind(this);
  }

  handleFeedbackView(message) {
    this.setState({selectedFeedbackMessage: message});
  }

  close() {
    this.setState({selectedFeedbackMessage: null});
  }

  render() {
    return <div className="col-12">
      <div className="table-responsive">
        <table className="table table-hover">
          <thead>
            <tr>
              <th></th>
              <th>Training title</th>
              <th>Started date</th>
              <th>Failed/Success</th>
              <th>Feedback</th>
            </tr>
          </thead>
          <tbody>
            {this.props.tests.map((item, i) => {
            return <tr key={i}>
              <td>{i+1}</td>
              <td>{item.trainingTitle}</td>
              <td>{moment(item.startedAt).format('DD/MM/YYYY, h:mm:ss a')}</td>
              <td>{item.failed === 1 ? <span className="has-error">Failed</span> : item.failed === 0 ? "Success" : '' }</td>
              <td>{item.feedback && <i className="far fa-eye pointer" onClick={() => this.handleFeedbackView(item.feedback)}></i>}</td>
            </tr>;
          })
          }
          </tbody>
        </table>
        <div className={this.state.selectedFeedbackMessage ? "modal open" : "modal"} role="dialog">
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <button type="button" className="close" onClick={this.close}>&times;</button>
              </div>
              <div className="modal-body">
                <p className="text-center">{this.state.selectedFeedbackMessage}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>;
  }
}

export default Feedback;
