import { useQuery } from '@tanstack/react-query'
import { useEffect, useRef, useState } from 'react'

const fetchIssues = activeLabels => {
  const labelsParam = activeLabels.length === 0
     ? ''
     : `?labels=${activeLabels.map(label => label.name).join(',')}` 
return fetch(`https://api.github.com/repos/frontendbr/vagas/issues${labelsParam}`)
    .then(res => res.json())
    .then(data => {
      return data.map(issue => ({
        id: issue.id,
        state: issue.state,
        title: issue.title,
        createdAt: issue.created_at,
        author: { name: issue.user.login, avatar: issue.user.avatar_url },
        labels: issue.labels.map(label => ({ id: label.id, color: label.color, name: label.name })),
        url: issue.html_url
      }))
    })
}

const fetchLabels = async () => {
  const response = await fetch('https://api.github.com/repos/frontendbr/vagas/labels?per_page=100');
  const data = await response.json();
  return data.map(label => ({ id: label.id, name: label.name, color: label.color }));
}

console.log(fetchLabels());

const getFormattedDate = date => {
  const [year, month, day] = date.split('T')[0].split('-')
  return `${day}/${month}/${year}`
}

const Label = ({ isActive = false, label, onClickLabel }) => {
  // Verifica se label é undefined ou null
  if (!label) {
    return null; // Ou renderiza um elemento vazio, dependendo do seu caso
  }

  return (
    <button
      onClick={() => onClickLabel(label)}
      className={`label ${isActive ? 'activeLabel' : ''}`}
      style={{ backgroundColor: `#${label.color}` }}
    >
      {label.name}
    </button>
  )
}


const IssueItem = ({ state, title, createdAt, labels, author, url, onClickLabel }) =>
  <li>
    <span>{state}</span>
    <h3>
      <a href={url} target="_blank" rel="noreferrer">{title}</a>
    </h3>
    <div className="createdBy">
      <p>Criada em {getFormattedDate(createdAt)}, por {author.name}</p>
      <img src={author.avatar} alt={`Foto de ${author.name}`} />
    </div>
    {labels.length > 0 && (
      <p>Labels: {labels.map(label => 
        <Label key={label.id} onClickLabel={onClickLabel} label={label}/>)}
      </p>
    )}
  </li>


const SearhIssues = ({formRef, onSearchIssues}) => 
  <form ref={formRef} onSubmit={onSearchIssues}>
    <input
      type='search'
      name='inputSearchIssues'
      className='inputSearchIssues'
      placeholder='React'
      minLength={2} 
      required
      autoFocus
      />
      <button>Pesquisar</button>
  </form>

const IssuesList = ({activeLabels, onClickLabel}) => {
  
  const [serachItem, setSearchItem] = useState('');
  const formRef = useRef(null);

  useEffect(() => {
    if(serachItem.length > 0) {
      formRef.current.reset();
    }
  }, [serachItem]);


  const {isError, isLoading, error, data, isSuccess} = useQuery({
    queryKey: ['issues', {activeLabels: activeLabels.map(({name}) => name)},  activeLabels],
    queryFn: () => fetchIssues(activeLabels),
    refetchOnWindowFocus: false,
    staleTime: Infinity}
    )

  const searchIssues = e => {
    e.preventDefault();
    const { inputSearchIssues } = e.target.elements;
    setSearchItem(inputSearchIssues.value);
  }

  return (
    <div className='issuesListContainer'>
      <h1>Vagas</h1>
      <SearhIssues onSearchIssues={searchIssues} formRef={formRef} />
      {isError && <p>{error.message}</p>}
      {isLoading && <p>Carregando infos...</p>}
      {isSuccess && (
        <ul className='issuesList'>
          {data.map(issue => <IssueItem key={issue.id} onClickLabel={onClickLabel} {...issue}/>)}
        </ul>
      )}
    </div>
  )
}

const LabelList = ({activeLabels, onClickLabel}) => {
  const {isError, isLoading,isSuccess, error, data} = useQuery({
    queryKey: ['labels'],
    queryFn: fetchLabels,
    refetchOnWindowFocus: false,
    staleTime: Infinity
  })

  console.log('dataLabels :',data);
  
  return (
    <div className='labelsListContainer'>
      <h2>Label</h2>
      {isError && <p>{error.message}</p>}
      {isLoading && <p>Carregando infos...</p>}
      {isSuccess &&  <ul className='labelsList'>
          {data.map(label => {
            const isActive = activeLabels.some(activeLabel => label.id === activeLabel.id)
            return (
               <li
               onClick={() => onClickLabel(label)}
               className={`label ${isActive ? 'activeLabel' : ''}`} 
               style={{
                 borderRadius: '10px',
                 backgroundColor:`#${label.color}`, 
                 padding:'5px', 
                 margin:'3px'}} 
                 key={label.id}
                 >
                   {label.name}
                </li>
            )
          })}
        </ul> }
    </div>
  )
}

const App = () => {
  const [activeLabels, setActiveLabels] = useState([]);
  const markAsActive = label => setActiveLabels(prev => {
    const isAlreadyActive = prev.some(prevLabel => prevLabel.id === label.id);
    return isAlreadyActive ? prev.filter(prevLabel => prevLabel.id !== label.id) : [...prev, label];
  })

  return (
    <div className='app'>
      <IssuesList activeLabels={activeLabels} onClickLabel={markAsActive}/>
      <LabelList activeLabels={activeLabels} onClickLabel={markAsActive}/>
    </div>
  )
}

export { App }
