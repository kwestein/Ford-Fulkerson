Rails.application.routes.draw do
  root 'graph#index'

  post '/serialize', to: 'graph#serialize'
  get '/graph', to: 'graph#show'
end
