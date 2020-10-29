import ReactDOM from "react-dom";
import React from "react";
import "./styles.css";

class NameForm extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      // responseToPost: '',
      value: 'frank ocean',
      response: '',
    };

    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);

};

  callApi = async () => {
    const response = await fetch('/');
    const body = await response.json();

    if (response.status !== 200) throw Error(body.message);
    return body;
  };

    componentDidMount() {
      this.callApi()
        .then(res => this.setState({ response: res.express }))
        .catch(err => console.log(err));
    }

  handleChange(event) {
    this.setState({ value: event.target.value });
  }

  handleSubmit = async event => {
    alert(this.state.value);
    event.preventDefault();
    let headers = new Headers({
      "Content-Type" : "application/json",
      "User-Agent"   : "MY-UA-STRING"
    });
    const request = await fetch('/', {
      method: 'POST',
      headers: headers,
      body: JSON.stringify({ artistName: this.state.value }),
    });
    // const body = await request.text();
    // this.setState({ responseToPost: body });

  }

  render() {
    return (
      <div>
      <p>{this.state.response}</p>
      <form onSubmit={this.handleSubmit}>
        <label>
          Artist Name:
          <input type="text" value={this.state.value} onChange={this.handleChange}/>
        </label>
        <input type="submit" value="Submit" />
      </form>
      <p>{this.state.response}</p>
      </div>
    );
  }
}

ReactDOM.render(<NameForm />, document.getElementById("root"));

export default NameForm;
