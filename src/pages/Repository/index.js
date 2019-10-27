import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import api from '../../services/api';

import Container from '../../components/Container';
import {
    Loading,
    Owner,
    IssueList,
    IssueFilter,
    IssuePaginate,
} from './styles';

export default class Repository extends Component {
    static propTypes = {
        match: PropTypes.shape({
            params: PropTypes.shape({
                repository: PropTypes.string,
            }),
        }).isRequired,
    };

    state = {
        repository: {},
        issues: [],
        loading: true,
        filters: [
            { state: 'all', name: 'Todas' },
            { state: 'open', name: 'Abertas' },
            { state: 'closed', name: 'Fechadas' },
        ],
        issuesState: 'open',
        page: 1,
    };

    async componentDidMount() {
        const { match } = this.props;
        const repoName = decodeURIComponent(match.params.repository);

        const [repository, issues] = await Promise.all([
            api.get(`/repos/${repoName}`),
            api.get(`/repos/${repoName}/issues`, {
                params: {
                    state: 'open',
                    per_page: 5,
                },
            }),
        ]);

        this.setState({
            repository: repository.data,
            issues: issues.data,
            loading: false,
            repoName,
        });
    }

    getIssues = (state = 'open', page) => {
        const { repoName } = this.state;

        return api.get(`/repos/${repoName}/issues`, {
            params: {
                page,
                state,
                per_page: 5,
            },
        });
    };

    handleFilter = async state => {
        const issues = await this.getIssues(state);

        this.setState({ issues: issues.data, issuesState: state, page: 1 });
    };

    handlePagination = async direction => {
        const { issuesState, page } = this.state;
        const toPage = direction === 'prev' ? page - 1 : page + 1;

        const issues = await this.getIssues(issuesState, toPage);

        this.setState({ issues: issues.data, page: toPage });
    };

    render() {
        const { repository, issues, loading, filters, page } = this.state;

        if (loading) {
            return <Loading>Carregando</Loading>;
        }

        return (
            <Container>
                <Owner>
                    <Link to="/">Voltar aos repositórios</Link>
                    <img
                        src={repository.owner.avatar_url}
                        alt={repository.owner.login}
                    />
                    <h1>{repository.name}</h1>
                    <p>{repository.description}</p>
                </Owner>

                <IssueList>
                    <IssueFilter>
                        {filters.map(filter => (
                            <button
                                key={filter.state}
                                type="button"
                                onClick={() => this.handleFilter(filter.state)}
                            >
                                {filter.name}
                            </button>
                        ))}
                    </IssueFilter>
                    {issues.map(issue => (
                        <li key={String(issue.id)}>
                            <img
                                src={issue.user.avatar_url}
                                alt={issue.user.login}
                            />
                            <div>
                                <strong>
                                    <a href={issue.html_url}>{issue.title}</a>
                                    {issue.labels.map(label => (
                                        <span key={String(label.id)}>
                                            {label.name}
                                        </span>
                                    ))}
                                </strong>
                                <p>{issue.user.login}</p>
                            </div>
                        </li>
                    ))}
                    <IssuePaginate>
                        <button
                            type="button"
                            onClick={() => this.handlePagination('prev')}
                            disabled={page === 1}
                        >
                            {'< Anterior'}
                        </button>
                        <button
                            type="button"
                            onClick={() => this.handlePagination('next')}
                        >
                            {'Próxima >'}
                        </button>
                    </IssuePaginate>
                </IssueList>
            </Container>
        );
    }
}
