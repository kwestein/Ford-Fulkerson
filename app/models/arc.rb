class Arc < ActiveRecord::Base
	has_one :head, class_name: 'Node', primary_key: :head_id, foreign_key: :id
	has_one :tail, class_name: 'Node', primary_key: :tail_id, foreign_key: :id
end