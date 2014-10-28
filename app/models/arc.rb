class Arc < ActiveRecord::Base
	has_one :head, class_name: 'Node', foreign_key: :id
	has_one :tail, class_name: 'Node', foreign_key: :id
end
