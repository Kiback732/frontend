import React from 'react';
import axios from 'axios';
import { API_BASE, API_URL } from './urls';
import './App.css';

export default class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      fetching: false,
      message: '',
      title: '',
      description: '',
      file: null,
      imageValue: '',
      allData: [],
    };
  }

  handleData = (e) => {
    if (e.target.name !== 'file') {
      this.setState({ [e.target.name]: e.target.value });
      return;
    }
    this.setState({
      [e.target.name]: e.target.files[0],
      imageValue: e.target.value && e.target.files[0].name
    });
  }

  openMessage = (message) => {
    this.setState({ message });
    setTimeout(() => this.setState({ message: '' }), 5000);
  }

  sendData = async (title, description, image, form) => {
    this.setState({ fetching: true });
    let formData = new FormData();
    formData.append('image', image);
    formData.append('title', title);
    formData.append('description', description);
    try {
      const response = await axios.post(API_URL, formData, {
        headers: { 'content-type': 'multipart/form-data' }
      });
      form.reset();
      this.setState({
        fetching: false,
        title: '',
        description: '',
        file: null,
        allData: [response.data, ...this.state.allData]
      });
      this.openMessage('Data added');
    } catch (error) {
      console.error('Data sending error:', error);
      this.setState({ fetching: false });
      this.openMessage('Data sending error');
    }
  };

  handleSubmit = (e) => {
    e.preventDefault();
    const { title, description, file } = this.state;
    if (title.trim() && description.trim() && file) {
      this.sendData(title.trim(), description.trim(), file, e.target);
      return;
    }
    this.openMessage('Fill in all the data');
  }

  handleGetData = async () => {
    try {
      const response = await axios.get(API_URL);
      response.data.sort((a, b) => b.id - a.id);
      this.setState({ allData: response.data, fetching: false });
      this.openMessage('Data received');
    } catch (error) {
      console.error('Data request error:', error);
      this.setState({ fetching: false });
      this.openMessage('Data request error');
    }
  }

  handleDeleteData = (id) => async () => {
    try {
      const response = await axios.delete(`${API_URL}/${id}`);
      this.setState({
        fetching: false,
        allData: this.state.allData.filter((item) => item.id !== response.data.id),
      });
      this.openMessage('Data removed');
    } catch (error) {
      console.error('Data removing error:', error);
      this.setState({ fetching: false });
      this.openMessage('Data removing error');
    }
  }

  renderAllData = () => {
    const { allData, fetching } = this.state;
    if (!allData) return null;

    return allData.map(({ id, title, image, description }) => (
      <li className="data-output__item" key={id}>
        <h2 className="data-output__title">{title}</h2>
        <div className="data-output__content">
          <img src={`${API_BASE}/${image}`} alt="Common" title="Common" className="data-output__image" />
          <span className="data-output__description">
            {description}
          </span>
          <button
            type="button"
            className="data-output__button"
            disabled={fetching}
            onClick={this.handleDeleteData(id)}
          >
            Remove
          </button>
        </div>
      </li>
    ));
  }

  render() {
    const { fetching, message, title, description, imageValue } = this.state;

    return (
      <React.Fragment>
        <header>
          <h1 className="title">Education application</h1>
        </header>
        <main>
          <div className="container">
            <section className="data-input">
              <form action="" onSubmit={this.handleSubmit}>
                <label className="data-input__label">
                  Header:
                  <input
                    type="text"
                    name="title"
                    className="data-input__title"
                    value={title}
                    disabled={fetching}
                    onChange={this.handleData}
                    autoComplete="off"
                    autoFocus
                  />
                </label>
                <label className="data-input__label">
                  Description:
                  <textarea
                    type="text"
                    name="description"
                    className="data-input__description"
                    value={description}
                    disabled={fetching}
                    onChange={this.handleData}
                  />
                </label>
                <div className="data-input__label-wrapper">
                  <label className="data-input__label data-input__label--file">
                    Choose image to upload
                    <input
                      type="file"
                      name="file"
                      className="data-input__file"
                      accept="image/*"
                      disabled={fetching}
                      onChange={this.handleData}
                    />
                  </label>
                  <div className="data-input__file-value">
                    {imageValue || 'No file selected'}
                  </div>
                </div>
                <button
                  type="submit"
                  className="data-input__submit"
                  disabled={fetching}
                >
                  Add
                </button>
                {message && <div className="message">{message}</div>}
              </form>
            </section>
            <section className="data-output">
              <button
                type="button"
                className="data-output__button data-output__button--get-data"
                disabled={fetching}
                onClick={this.handleGetData}
              >
                Show all
              </button>
              <ul>
                {this.renderAllData()}
              </ul>
            </section>
          </div>
        </main>
      </React.Fragment>
    );
  }
}
