import React, { Component } from 'react';
import { FaGithubAlt, FaPlus, FaSpinner } from 'react-icons/fa';
import { Link } from 'react-router-dom';

import api from '../../services/api';

import Container from '../../components/Container';
import { Form, SubmitButton, List, InputRepo } from './styles';

export default class Main extends Component {
    state = {
        newRepo: '',
        repositories: [],
        loading: false,
        error: '',
    };

    componentDidMount() {
        const repositories = localStorage.getItem('repositories');

        if (repositories) {
            this.setState({ repositories: JSON.parse(repositories) });
        }
    }

    componentDidUpdate(_, prevState) {
        const { repositories } = this.state;

        if (prevState.repositories !== repositories) {
            localStorage.setItem('repositories', JSON.stringify(repositories));
        }
    }

    handleInputChange = e => {
        this.setState({ newRepo: e.target.value });
    };

    handleSubmit = async e => {
        e.preventDefault();

        this.setState({ loading: true });

        const { newRepo, repositories } = this.state;

        try {
            const repo = repositories.find(r => r.name === newRepo);
            if (repo) {
                throw new Error('Repositório duplicado');
            }

            const response = await api.get(`/repos/${newRepo}`);

            const data = { name: response.data.full_name };

            this.setState({
                repositories: [...repositories, data],
                newRepo: '',
                error: '',
                loading: false,
            });
        } catch (err) {
            const error =
                err.message === 'Request failed with status code 404'
                    ? 'Repositório não encontrado'
                    : err.message;
            this.setState({ error, loading: false });
        }
    };

    render() {
        const { newRepo, loading, repositories, error } = this.state;

        return (
            <Container>
                <h1>
                    <FaGithubAlt />
                    Repositórios
                </h1>

                <Form onSubmit={this.handleSubmit}>
                    <div>
                        <InputRepo
                            type="text"
                            placeholder="Adicionar repositório"
                            value={newRepo}
                            onChange={this.handleInputChange}
                            error={error}
                        />

                        <SubmitButton loading={loading}>
                            {loading ? (
                                <FaSpinner color="#fff" size={14} />
                            ) : (
                                <FaPlus color="#fff" size={14} />
                            )}
                        </SubmitButton>
                    </div>
                    {error && <span>{error}</span>}
                </Form>

                <List>
                    {repositories.map(repository => (
                        <li key={repository.name}>
                            <span>{repository.name}</span>
                            <Link
                                to={`/repository/${encodeURIComponent(
                                    repository.name
                                )}`}
                            >
                                Detalhes
                            </Link>
                        </li>
                    ))}
                </List>
            </Container>
        );
    }
}
