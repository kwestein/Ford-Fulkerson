class Node < ActiveRecord::Base
	has_and_belongs_to_many :paths

	validates :number, uniqueness: true
end
