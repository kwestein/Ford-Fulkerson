class GraphController < ApplicationController
	def index
		subpaths = [[1]]
		i = 0
		done = false
		while !done 
			if subpaths[i] == nil
				done = true 
			elsif subpaths[i].last == sink
				Path.new(subpaths[i], 0)
				i++
			else 
				arcs = Arc.where("tail = ?", subpaths[i].last)
				for Arc arc in arcs
					if !subpaths[i] contains[arc.head]
						subpaths.add(subpaths[i]+arc.head)
				i++
			end
		end
		

		paths = Path.all
		while (!done)
			for Path path in paths
				maxFlow = 9999999999
			end
			for (int i = 0; i <= path.nodes.count - 1)
				arc = Arc.where("tail = ? and head = ?", path.nodes[i], path.nodes[i+1])
				if arc.flow < maxFlow
					maxFlow = arc.flow
				end
			end
			path.maxFlow = maxFlow
			nextPath = Path.maximum("maxFlow")
			if nextPath.maxFlow > 0
				for (int i = o; i < nextPath.nodes.count - 1)
					forwardArc = Arc.where("tail = ? and head = ?", path.nodes[i], path.nodes[i+1])
					backwardArc = Arc.where("tail = ? and head = ?", path.nodes[i+1], path.nodes[i])
					forwardArc.flow -= nextPath.maxFlow
					backwardArc.flow += nextPath.maxFlow
				end
			else
				done = true
			end
		end
				#Stop and display

		# TODO: min cut
	end
end
